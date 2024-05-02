import json
import requests
import pandas as pd
from datetime import datetime

def load_location_template(location):
    """Load the location search criteria from a JSON file in the templates directory."""
    try:
        with open(f'templates/{location.lower()}.json', 'r') as file:
            return json.load(file)
    except FileNotFoundError:
        print(f"Pohjaa ei löydy kohteelle {location}. Varmista, että pohja on olemassa.")
    except json.JSONDecodeError:
        print("Ongelma json-tiedoston lukemisessa. Tarkista tiedoston sisältö.")
    return None


def make_request(payload, session):
    """Send a POST request to the API with the given payload."""
    try:
        url = 'https://www.etuovi.com/api/v2/announcements/search/listpage'
        print("Haetaan kohteita.")
        response = session.post(url, headers=session.headers, json=payload)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f"tapahtui virhe: {e}")
    return None


def create_search_payload(location_criteria, criteria):
    """ Generate the search payload using the user inputs and the loaded location criteria. """
    price_max = criteria.price_max
    year_min = criteria.year_min
    size_min = criteria.size_min
    
    if location_criteria:
        return {
            "locationSearchCriteria": location_criteria,
            "pagination": {
                "firstResult": 0,
                "maxResults": 30,
                "page": 1
            },
        "sortingOrder": {
            "property": "PUBLISHED_OR_UPDATED_AT",
            "direction": "DESC"
        },
        "priceMin": None,
        "priceMax": price_max * 10**3,
        "sizeMin": size_min,
        "sizeMax": None,
        "yearMin": year_min,
        "yearMax": None,
        "propertyType": "RESIDENTIAL",
        "residentialPropertyTypes": ["APARTMENT_HOUSE"],
        "bidType": "ALL",
        "sellerType": "ALL",
        "newBuildingSearchCriteria": "ALL_PROPERTIES",
        "ownershipTypes": ["OWN"],
        "plotHoldingTypes": ["OWN", "OPTIONAL_RENTAL"],
        "freeTextSearch": "",
        "maintenanceChargeMin": None,
        "maintenanceChargeMax": None,
        "plotAreaMin": None,
        "plotAreaMax": None,
        "priceSquareMeterMin": None,
        "priceSquareMeterMax": None,
        "publishingTimeSearchCriteria": "ANY_DAY",
        "showingSearchCriteria": {}
        }


def fetch_apartment_details(friendly_id, session):
    """ Fetch details for a specific apartment by friendlyId. """
    api_url = f'https://www.etuovi.com/api/v2/announcement/details?friendlyId={friendly_id}'
    try:
        response = session.get(api_url)
        response.raise_for_status()
        return response.json()  # Return the parsed JSON data
    except requests.RequestException as e:
        print(f"Ongelma kohteiden tarkkojen tietojen hakemisessa: {e}")
        return None


def extract_details(details, user_max_limit, interest_rate):
    # User selling price limit before anything else
    if user_max_limit:
        price = details.get('debfFreePrice')
        dept_free = details.get('sellingPrice')
        if dept_free - 0.1 * price > user_max_limit:
            return None
        
    # Extracting periodic charges and filtering for 'HOUSING_COMPANY_MAINTENANCE_CHARGE'
    periodic_charges = details.get('property', {}).get('periodicCharges', [])
    maintenance_charge = next((item['price'] for item in periodic_charges if item['periodicCharge'] == 'HOUSING_COMPANY_MAINTENANCE_CHARGE'), 0)
    plot_rent = next((item['price'] for item in periodic_charges if item['periodicCharge'] == 'RENTAL_FEE_FOR_THE_PLOT'), 0)

    # Sum the charges
    total_charge = maintenance_charge + plot_rent
    
    # Calculate financial charge
    residence_details = details.get('residenceDetailsDTO', {})
    construction_year = residence_details.get('constructionFinishedYear')
    loan_time_left = 23 - (datetime.now().year - construction_year) # Average loan 25 years with two years of moratorium
    dept = details.get('debtShareAmount', 0)
    financial_charge = 0
    if dept != 0:
        financial_charge = (dept * interest_rate)/12 + (dept / loan_time_left)/12
    
    # Navigate through nested dictionaries safely
    address = details.get('property', {}).get("streetAddressFreeForm", None)
    housing_info = residence_details.get('housingCompanyApartmentInformationDTO', {})
    living_area = residence_details.get('livingArea')
    
    housing_company_details = details.get('property', {}).get('housingCompany', {})
    plot_holding_type = housing_company_details.get('plot', {}).get('holdingType', None)
    if plot_holding_type == "OPTIONAL_RENTAL":
        plot_holding_type = 'valinnainen'
    elif plot_holding_type == "OWN":
        plot_holding_type = 'oma'
    purchasing_share_of_plot = details.get('purchasingShareOfPlot', 0)
    
    # Creating a dictionary to hold the extracted data
    data = {
        'Kohdenumero': details.get('friendlyId'),
        'Osoite': address,
        'Myyntihinta': details.get('sellingPrice'),
        'Velaton': details.get('debfFreePrice'),
        'Lainanosuus': dept,
        'Hoitovastike': total_charge,
        'Rahoitusvastike': financial_charge,
        'Koko': living_area,
        'Kerros': housing_info.get('floorLevel'),
        'Valmistunut': construction_year,
        'Tontti': plot_holding_type,
        'Tontin_lunastusosuus': purchasing_share_of_plot
    }
    return data

    
def extract_detailed_data(search_data, criteria, session):
    print("Haetaan kohteiden tarkkoja tietoja")
    detailed_results = []  # List to store extracted data
    user_max_limit = criteria.user_max_limit
    interest_rate = criteria.interest_rate

    for announcement in search_data['announcements']:
        if 'friendlyId' in announcement:
            friendly_id = announcement['friendlyId']
            apartment_details = fetch_apartment_details(friendly_id, session)
            if apartment_details:
                # Process each apartment's details through extract_details
                extracted_data = extract_details(apartment_details, user_max_limit, interest_rate)
                if extracted_data:
                    detailed_results.append(extracted_data)  # Add the processed data to the list
            else:
                print(f"Tietoja asunnolle {friendly_id} ei voitu hakea.")

    # Convert the list of dictionaries to a DataFrame
    if detailed_results:
        df = pd.DataFrame(detailed_results)
        print(df.head())
        return df
    else:
        return {"message": "Ei kriteerit täyttäviä kohteita."}
    