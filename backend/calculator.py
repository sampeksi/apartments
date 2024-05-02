from datetime import datetime


def calculate_cash_flow(property):
    rent = property.arvioitu_vuokra
    maintenance = property.hoitovastike
    interest_fee = calculate_interest(property)
    loan_payment = calculate_loan_payment(property)
    return (rent - maintenance) * 12 - interest_fee - loan_payment


def calculate_cash_flow_5(property):
    rent = property.arvioitu_vuokra
    maintenance = property.hoitovastike
    interest_fee = calculate_interest(property, 5)
    loan_payment = calculate_loan_payment(property)
    return (rent - maintenance) * 12 - interest_fee - loan_payment


def calculate_cash_flow_10(property):
    rent = property.arvioitu_vuokra
    maintenance = property.hoitovastike
    interest_fee = calculate_interest(property, 10)
    loan_payment = calculate_loan_payment(property)
    return (rent - maintenance) * 12 - interest_fee - loan_payment


def calculate_yield(property):
    return (property.arvioitu_vuokra - property.hoitovastike) * 12 / property.velaton


def calculate_roi(property):
    annual_profit = (property.arvioitu_vuokra - property.hoitovastike) * 12
    interest_fee = calculate_interest(property)
    investment = property.myyntihinta
    return (annual_profit - interest_fee) / investment


def calculate_loan_payment(property):
    dept = property.lainaosuus
    loan_time_left = calculate_loan_time_left(property)
    return dept / loan_time_left


def calculate_interest(property, years=0):
    interest_rate = property.korkotaso
    dept = property.lainaosuus
    loan_time_left = calculate_loan_time_left(property)
    interest = dept * ((loan_time_left - years) / loan_time_left) * interest_rate
    return interest


def calculate_loan_time_left(property):
    construction_year = property.valmistunut
    # Loan time is 25 on average with 2 years of moratorium
    return 23 - (datetime.now().year - construction_year)