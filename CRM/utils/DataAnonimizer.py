import pandas as pd
import hashlib
import random
from datetime import datetime
import os

def anonymize_data(input_file, output_file):
    """
    Anonymize personal information and modify payment values in a CSV file.
    
    Args:
        input_file (str): Path to input CSV file (relative to script location)
        output_file (str): Path to output CSV file (relative to script location)
    """
    # Get the directory where the script is located
    script_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Convert relative paths to absolute paths
    input_path = os.path.join(script_dir, input_file)
    output_path = os.path.join(script_dir, output_file)
    
    # Create output directory if it doesn't exist
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    
    # Read the CSV file with ; delimiter and handle encoding
    df = pd.read_csv(input_path, delimiter=' ', encoding='utf-8')
    
    # Function to generate a consistent hash-based fake name
    def generate_fake_name(real_name):
        # Create a hash of the original name to ensure consistency
        name_hash = hashlib.md5(real_name.encode()).hexdigest()
        # Use the hash to generate a fake first and last name
        first_names = ['Ana', 'João', 'Maria', 'Pedro', 'Paulo', 'Clara', 'Lucas', 'Julia']
        last_names = ['Silva', 'Santos', 'Oliveira', 'Souza', 'Lima', 'Pereira', 'Costa']
        
        # Use different parts of the hash to select names
        first_name_index = int(name_hash[:8], 16) % len(first_names)
        last_name_index = int(name_hash[8:16], 16) % len(last_names)
        
        return f"{first_names[first_name_index]} {last_names[last_name_index]}"

    # Anonymize personal information
    df['Nome'] = df['Nome'].apply(generate_fake_name)
    
    # Mask CPF/CNPJ - keep only last 2 digits
    df['CPF ou CNPJ'] = df['CPF ou CNPJ'].apply(lambda x: '***.***.***-' + str(x)[-2:])
    
    # Mask email addresses
    df['Email'] = df['Email'].apply(lambda x: hashlib.md5(x.encode()).hexdigest()[:8] + '@anonymous.com')
    
    # Mask phone numbers
    for col in ['Celular', 'Fone']:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: str(x)[:2] + '*' * (len(str(x))-4) + str(x)[-2:] if pd.notna(x) else x)
    
    # Modify payment values with random variation (+/- 5%)
    for col in ['Valor', 'Valor original', 'Valor Líquido']:
        if col in df.columns:
            df[col] = df[col].apply(lambda x: round(float(x) * random.uniform(0.95, 1.05), 2) if pd.notna(x) else x)
    
    # Save the anonymized data
    df.to_csv(output_path, index=False, encoding='utf-8', sep=' ')
    
    return df

# Example usage
if __name__ == "__main__":
    # Using relative paths from the script's location
    input_file = "data/uploaded_data.csv"
    output_file = "data/uploaded_data_anonimized.csv"
    
    try:
        anonymized_df = anonymize_data(input_file, output_file)
        print("Data has been successfully anonymized and saved to", output_file)
    except Exception as e:
        print("An error occurred:", str(e))