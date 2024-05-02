# Asuntolaskuri
Aplikaatio hakee käyttäjän määrittelemien hakuparametrien perusteella etuovesta myytäviä asuntoja ja tekee niistä taulukon. Mikäli käyttäjä asettaa asunnoille vuokra-arvioita ohjelma tekee nappia painamalla taulukon, johon kohteet ovat listattu taloudellisten tunnuslukujen kanssa. Käyttäjä voi lajittella kohteita haluamansa tunnusluvun perusteella klikkaamalla sarakkeen otsikkoa. 

## Alustus

Huom. Ohjeet odottavat, että sinulla on python3, pip, nodejs ja npm asennettuina

1. Kloona repo ja mene sen juureen

2. Luo virtuaaliympäristö:
```
python3 -m venv venv
```

3. Aktivoi virtuaaliympäristö:
```
source venv/bin/activate
```

4. Asenna python-vaatimukset:
```
pip install -r requirements.txt
```

5. Siirry kansioon frontend/:
```
cd frontend
```

6. Asenna node-paketit:
```
npm install
```

6. Käynnistä ohjelma:
```
npm start
```