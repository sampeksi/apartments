from fastapi import FastAPI, HTTPException, Path
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel
import pandas as pd
import os
from typing import Optional
from typing import List
import requests

from etuovi import ( create_search_payload, make_request, 
                    extract_detailed_data, load_location_template )
from calculator import ( calculate_cash_flow, calculate_cash_flow_5, 
                        calculate_cash_flow_10, calculate_yield, calculate_roi )

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

data_frames = {}

# Models
class SearchCriteria(BaseModel):
    location: str
    price_max: Optional[int] = None
    year_min: Optional[int] = None
    size_min: Optional[int] = None
    user_max_limit: Optional[float] = None
    interest_rate: Optional[float] = 0.03

class Property(BaseModel):
    kohdenumero: str
    velaton: float
    myyntihinta: float
    lainaosuus: float
    hoitovastike: float
    valmistunut: int
    lunastusosuus: float
    arvioitu_vuokra: float
    korkotaso: float

class CalculationRequest(BaseModel):
    properties: List[Property]


session = requests.Session()


@app.on_event("startup")
async def startup_event():
    response = session.get('https://www.etuovi.com/')
    response.raise_for_status()
    csrf_token = session.cookies.get('XSRF-TOKEN', '')
    session.headers.update({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-XSRF-TOKEN': csrf_token,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
    })


@app.get("/")
def read_root():
    return JSONResponse(content={"message": "FastAPI backend is running!"}, status_code=200)


@app.post("/search/")
async def search_apartments(criteria: SearchCriteria):
    location_template = load_location_template(criteria.location)
    if not location_template:
        raise HTTPException(status_code=404, detail="Location template not found")

    payload = create_search_payload(location_template, criteria)
    search_results = make_request(payload, session)
    if not search_results or 'announcements' not in search_results:
        raise HTTPException(status_code=404, detail="No results found")

    print(f"Kohteet haettu onnistuneesti. Tuloksia {len(search_results['announcements'])}")
    detailed_data = extract_detailed_data(search_results, criteria, session)
    data_frames['resultsTable'] = detailed_data
    
    return detailed_data.to_dict(orient='records') 


@app.post("/calculate-metrics")
async def calculate_metrics(request: CalculationRequest):
    results = []
    for property in request.properties:
        try:
            cash_flow = calculate_cash_flow(property)
            cash_flow_5 = calculate_cash_flow_5(property)
            cash_flow_10 = calculate_cash_flow_10(property)
            calculated_yield = calculate_yield(property)
            roi = calculate_roi(property)
            
            results.append({
                "kohdenumero": property.kohdenumero,
                "kassavirta": cash_flow,
                "kassavirta_5": cash_flow_5,
                "kassavirta_10": cash_flow_10,
                "yield": calculated_yield,
                "ROI": roi
            })
        except Exception as e:
            raise HTTPException(status_code=400, detail=str(e))
    df = pd.DataFrame(results)
    data_frames['calculatedMetricsTable'] = df
    
    return {"results": results, "status": "success"}


@app.get("/download/{file_name}")
async def download_excel(file_name: str = Path(..., description="The name of the file to download")):
    if file_name not in data_frames:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Ensure the temp directory exists
    temp_dir = 'temp'
    if not os.path.exists(temp_dir):
        os.makedirs(temp_dir)
        
    # Assume the DataFrame is stored in memory
    df = data_frames.get(file_name)
    if df is None:
        raise HTTPException(status_code=404, detail="No data available")

    file_path = f"temp/{file_name}.xlsx"
    df.to_excel(file_path, index=False, engine='openpyxl')

    return FileResponse(path=file_path, filename=file_path, media_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')


@app.on_event("shutdown")
def cleanup():
    # Remove the entire temp directory and its contents
    temp_dir = 'temp'
    if os.path.exists(temp_dir):
        for filename in os.listdir(temp_dir):
            os.remove(os.path.join(temp_dir, filename))
        os.rmdir(temp_dir)
        