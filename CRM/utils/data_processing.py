import pandas as pd
import numpy as np
import streamlit as st
import plotly.express as px
import plotly.graph_objs as go
from scipy import signal



def find_column(data, possible_columns):
    """
    Find the first matching column name in the DataFrame.

    :param data: DataFrame to search
    :param possible_columns: List of possible column names to match
    :return: The first matching column name, or raises KeyError
    """
    # Normalize column names in the DataFrame
    def normalize(col):
        return (col.lower()
                .strip()
                .replace(' ', '_')
                .replace('ç', 'c')
                .replace('ã', 'a')
                .replace('é', 'e')
                .replace('í', 'i')
                .replace('ó', 'o'))

    column_mapping = {normalize(col): col for col in data.columns}

    # Normalize possible column names
    normalized_possible_columns = [normalize(col) for col in possible_columns]

    # Find the first matching column
    for normalized_col in normalized_possible_columns:
        if normalized_col in column_mapping:
            return column_mapping[normalized_col]

    # If no match found, raise an informative error
    raise KeyError(f"""
    Could not find a column matching any of: {possible_columns}
    Available columns: {list(data.columns)}
    
    Tip: Ensure column names are correctly formatted and match the expected structure.
    """)



def identify_enrollment_gaps(data, nome_column, date_column):
    """
    Helper function to identify payment gaps of 2+ months.
    
    :param data: DataFrame containing client data
    :param nome_column: Column name for client names
    :param date_column: Column name for dates
    :return: DataFrame with enrollment gaps
    """
    try:
        # Ensure correct column names
        nome_column = find_column(data, [nome_column, 'nome', 'name', 'client'])
        date_column = find_column(data, [date_column, 'Data de confirmação',  'data_de_pagamento', 'payment_date'])
        
        # Ensure date column is datetime
        data[date_column] = pd.to_datetime(data[date_column], errors='coerce')
        
        # Sort data
        sorted_data = data.sort_values([nome_column, date_column])
        
        # Calculate months between payments
        sorted_data['next_payment'] = sorted_data.groupby(nome_column)[date_column].shift(-1)
        sorted_data['months_to_next'] = ((sorted_data['next_payment'] - sorted_data[date_column]) / pd.Timedelta(days=30)).round(1)
        
        # Identify gaps (2+ months)
        gap_threshold = 2
        gaps = sorted_data[sorted_data['months_to_next'] > gap_threshold].copy()
        gaps['gap_end'] = sorted_data.groupby(nome_column)[date_column].shift(-1)
        
        return gaps[[nome_column, date_column, 'gap_end', 'months_to_next']]
    
    except Exception as e:
        st.error(f"Error in identifying enrollment gaps: {e}")
        return pd.DataFrame()

def calculate_customer_lifetime(data, nome_column, date_column):
    """
    Calculate customer lifetime in months, accounting for enrollment gaps.
    
    :param data: DataFrame containing client data
    :param nome_column: Column name for client names
    :param date_column: Column name for dates
    :return: DataFrame with customer lifetime metrics
    """
    try:
        # Ensure correct column names
        nome_column = find_column(data, [nome_column, 'nome', 'name', 'client'])
        date_column = find_column(data, [date_column, 'data_de_pagamento', 'Data de confirmação', 'payment_date'])
        
        # Ensure date column is datetime
        data[date_column] = pd.to_datetime(data[date_column], errors='coerce')
        
        # Drop rows with invalid dates
        data = data.dropna(subset=[date_column])
        
        if data.empty:
            st.warning("No valid data found after processing dates.")
            return pd.DataFrame()
        
        # Identify gaps
        gaps = identify_enrollment_gaps(data, nome_column, date_column)
        
        lifetime_data = []
        for customer in data[nome_column].unique():
            customer_gaps = gaps[gaps[nome_column] == customer]
            customer_data = data[data[nome_column] == customer]
            
            if len(customer_gaps) == 0:
                # No gaps - use original calculation
                total_days = (customer_data[date_column].max() - customer_data[date_column].min()).days
            else:
                # Calculate active periods between gaps
                total_days = 0
                period_start = customer_data[date_column].min()
                for _, gap in customer_gaps.iterrows():
                    total_days += (gap[date_column] - period_start).days
                    period_start = gap['gap_end']
                
                if period_start is not None:
                    total_days += (customer_data[date_column].max() - period_start).days
            
            lifetime_data.append({
                nome_column: customer,
                'min': customer_data[date_column].min(),
                'max': customer_data[date_column].max(),
                'customer_lifetime_months': round(total_days / 30, 1),
                'gap_count': len(customer_gaps)
            })
        
        lifetime = pd.DataFrame(lifetime_data)
        lifetime = lifetime.set_index(nome_column)
        return lifetime.sort_values(by='customer_lifetime_months', ascending=False)
    
    except Exception as e:
        st.error(f"Error in calculating customer lifetime: {e}")
        return pd.DataFrame()

def calculate_lifetime_value(data, nome_column, amount_column):
    """
    Calculate the Lifetime Value (LTV) as the sum of amounts for each client.
    
    :param data: DataFrame containing client data
    :param nome_column: Column name for client names
    :param amount_column: Column name for transaction amounts
    :return: DataFrame with LTV metrics
    """
    try:
        # Ensure correct column names
        nome_column = find_column(data, [nome_column, 'nome', 'name', 'client'])
        amount_column = find_column(data, [amount_column, 'valor', 'amount', 'value'])
        date_column = find_column(data, ['data_de_pagamento', 'Data de confirmação', 'payment_date'])
        
        # Calculate lifetime and total value
        lifetime = calculate_customer_lifetime(data, nome_column, date_column)
        
        if lifetime.empty:
            st.warning("Could not calculate customer lifetime.")
            return pd.DataFrame()
        
        # Calculate total value per customer
        ltv = data.groupby(nome_column)[amount_column].sum()
        
        # Combine lifetime and total value
        result = pd.DataFrame({
            'total_value': ltv,
            'active_months': lifetime['customer_lifetime_months'],
            'gap_count': lifetime['gap_count']
        })
        
        # Calculate monthly average
        result['monthly_average'] = result['total_value'] / result['active_months'].replace(0, np.nan)
        
        return result.sort_values('total_value', ascending=False)
    
    except Exception as e:
        st.error(f"Error in calculating lifetime value: {e}")
        return pd.DataFrame()

# In utils/data_processing.py

def find_top_months(data, date_column='Data de confirmação'):
    """
    Find ranking of months with highest new clients, aggregated by month across all years.
    
    :param data: DataFrame containing client data
    :param date_column: Column name for dates (default is 'Data de confirmação')
    :return: Tuple of (month_counts, total_years)
    """
    try:
        # Ensure correct column names
        nome_column = find_column(data, ['nome', 'name', 'client'])
        date_column = find_column(data, [date_column, 'data_de_pagamento', 'payment_date', 'data_confirmacao'])
        
        # Ensure date column is datetime
        data[date_column] = pd.to_datetime(data[date_column], errors='coerce')
        
        # Drop rows with invalid dates
        data = data.dropna(subset=[date_column])
        
        if data.empty:
            st.warning("No valid data found for month analysis.")
            return pd.Series(), 0
        
        # Find first payment for each client
        first_payments = data.groupby(nome_column)[date_column].min()
        
        # Calculate total unique years
        total_years = first_payments.dt.year.nunique()
        
        # Extract month for first payments
        first_payments_month = first_payments.dt.month
        
        # Count new clients per month
        month_counts = first_payments_month.value_counts().reindex(range(1, 13), fill_value=0)  # Ensure all months are included
        
        return month_counts, total_years
    
    except Exception as e:
        st.error(f"Error in finding top months: {str(e)}")
        return pd.Series(), 0

def find_cancellation_months(data, date_column='Data de confirmação', gap_months=3):
    """
    Find ranking of months with highest client cancellations based on extended payment gaps.
    
    :param data: DataFrame containing client data
    :param date_column: Column name for dates (default is 'Data de confirmação')
    :param gap_months: Number of months without payment to consider as cancellation
    :return: Tuple of (cancellation_months, total_years)
    """
    try:
        # Ensure correct column names
        nome_column = find_column(data, ['nome', 'name', 'client'])
        date_column = find_column(data, [date_column, 'data_de_pagamento', 'payment_date', 'data_confirmacao'])
        
        # Ensure date column is datetime
        data[date_column] = pd.to_datetime(data[date_column], errors='coerce')
        
        # Drop rows with invalid dates
        data = data.dropna(subset=[date_column])
        
        if data.empty:
            st.warning("No valid data found for cancellation analysis.")
            return pd.Series(), 0
        
        # Group payments by client and sort
        client_payments = data.sort_values([nome_column, date_column])
        
        # Find the last payment for each client
        last_payments = client_payments.groupby(nome_column)[date_column].max()
        
        # Calculate the time since last payment
        current_date = pd.Timestamp.now()
        time_since_last_payment = (current_date - last_payments) / pd.Timedelta(days=30)
        
        # Identify clients with extended inactivity
        cancelled_clients = time_since_last_payment[time_since_last_payment > gap_months]
        
        # If no cancelled clients, return empty series
        if cancelled_clients.empty:
            return pd.Series(0, index=range(1, 13)), 0
        
        # Get the month of the last payment for cancelled clients
        cancellation_months = last_payments.loc[cancelled_clients.index].dt.month
        
        # Count cancellations by month
        cancellation_counts = cancellation_months.value_counts().reindex(range(1, 13), fill_value=0)
        
        # Calculate total unique years
        total_years = client_payments[date_column].dt.year.nunique()
        
        return cancellation_counts, total_years
    
    except Exception as e:
        st.error(f"Error in finding cancellation months: {str(e)}")
        return pd.Series(), 0



def show_lifetime_value(data):
    """Display lifetime value analysis."""
    st.subheader("Lifetime Value Analysis")
    
    try:
        ltv = calculate_lifetime_value(data, 'Nome', 'Valor')
        
        if ltv.empty:
            st.warning("No lifetime value data found.")
            return
        
        # Display the lifetime value metrics
        st.write(ltv)
        
    except Exception as e:
        st.error(f"Error in displaying lifetime value: {e}")

def show_customer_lifetime(data):
    """Display customer lifetime metrics."""
    st.subheader("Customer Lifetime Analysis")
    
    try:
        lifetime = calculate_customer_lifetime(data, 'Nome', 'Data de confirmação')
        
        if lifetime.empty:
            st.warning("No customer lifetime data found.")
            return
        
        # Display the customer lifetime metrics
        st.write(lifetime)
        
    except Exception as e:
        st.error(f"Error calculating customer lifetime: {e}")

def load_and_preprocess_data(file):
    """
    Load and preprocess the uploaded data file.
    
    :param file: Uploaded file object
    :return: Preprocessed DataFrame
    """
    # Read the file based on its extension
    if file.name.endswith('.csv'):
        df = pd.read_csv(file)
    else:
        df = pd.read_excel(file)
    
    # Preprocess the data
    df.columns = df.columns.str.strip().str.lower().str.replace(' ', '_').str.replace('ç', 'c').str.replace('ã', 'a').str.replace('é', 'e')
    
    # Convert date columns to datetime
    date_columns = [col for col in df.columns if 'data' in col or 'date' in col]
    for col in date_columns:
        df[col] = pd.to_datetime(df[col], errors='coerce')
    
    # Convert numeric columns
    numeric_columns = [col for col in df.columns if 'valor' in col or 'amount' in col or 'preco' in col]
    for col in numeric_columns:
        df[col] = pd.to_numeric(df[col], errors='coerce')
    
    return df