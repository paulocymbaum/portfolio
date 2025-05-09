import os
import json
import pandas as pd

class StateManager:
    def __init__(self):
        # Dynamically resolve the base directory
        base_dir = os.path.dirname(os.path.abspath(__file__))
        self.data_dir = os.path.join(base_dir, 'data')
        self.leads_file = os.path.join(self.data_dir, 'leads.json')
        self.uploaded_data_file = os.path.join(self.data_dir, 'uploaded_data.csv')

        # Debug: Verify paths
        print(f"Resolved data directory: {self.data_dir}")
        print(f"Resolved leads file path: {self.leads_file}")
        print(f"Resolved uploaded data file path: {self.uploaded_data_file}")

        # Create directory and initialize the leads file
        try:
            os.makedirs(self.data_dir, exist_ok=True)
        except Exception as e:
            print(f"Error creating data directory: {e}")
            raise
        
        if not os.path.exists(self.leads_file):
            self.initialize_leads_file()

    def initialize_leads_file(self):
        try:
            initial_data = []
            with open(self.leads_file, 'w') as f:
                json.dump(initial_data, f, indent=4)
            print(f"Initialized leads file at {self.leads_file}")
            return True
        except Exception as e:
            print(f"Error initializing leads file: {e}")
            return False
        
    def load_leads(self):
        try:
            if not os.path.exists(self.leads_file):
                print("Leads file does not exist. Initializing...")
                return self.initialize_leads_file()

            if os.path.getsize(self.leads_file) == 0:
                print("Leads file is empty. Initializing...")
                return self.initialize_leads_file()

            with open(self.leads_file, 'r') as f:
                leads = json.load(f)
                print(f"Loaded leads from file: {leads}")
                return leads if isinstance(leads, list) else []
        except Exception as e:
            print(f"Error loading leads: {e}")
            return []


    def save_leads(self, leads):
        print(f"Leads file path: {self.leads_file}")

        try:
            print(f"Attempting to save leads: {leads}")  # Debug log
            with open(self.leads_file, 'w') as f:
                json.dump(leads, f, indent=4)
                f.flush()
                os.fsync(f.fileno())
            print(f"Leads successfully saved to {self.leads_file}")  # Debug log
            return True
        except Exception as e:
            print(f"Error saving leads: {e}")  # Debug log
            return False



    def save_uploaded_data(self, df):
        try:
            df.to_csv(self.uploaded_data_file, index=False)
            print(f"Data successfully saved to {self.uploaded_data_file}")
        except Exception as e:
            print(f"Error saving uploaded data: {e}")
    
    def load_uploaded_data(self):
        try:
            if not os.path.exists(self.uploaded_data_file):
                print("Uploaded data file does not exist")
                return None

            if os.path.getsize(self.uploaded_data_file) == 0:
                print("Uploaded data file is empty")
                return None

            df = pd.read_csv(self.uploaded_data_file)
            if df.empty:
                print("Loaded DataFrame is empty")
                return None
                
            return df
            
        except pd.errors.EmptyDataError:
            print("Empty CSV file")
            return None
        except Exception as e:
            print(f"Error loading uploaded data: {e}")
            return None