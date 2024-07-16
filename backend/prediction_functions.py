from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import accuracy_score
import numpy as np
from sklearn.preprocessing import LabelEncoder
def preprocess_data(data_df, X_test):
    columns_to_encode = ['Specialty', 'Insurance', 'Gender']
    label_encoders = {}
    for col in columns_to_encode:
        label_encoders[col] = LabelEncoder()
        data_df[col] = label_encoders[col].fit_transform(data_df[col])
        X_test[col] = label_encoders[col].transform(X_test[col])

    quartile_1 = data_df['Amount'].quantile(0.25)
    quartile_3 = data_df['Amount'].quantile(0.75)
    IQR = quartile_3 - quartile_1
    lower_bound = quartile_1 - 1 * IQR
    upper_bound = quartile_3 + 1 * IQR
    outliers = data_df[(data_df['Amount'] < lower_bound) | (data_df['Amount'] > upper_bound)]
    data_df = data_df.drop(outliers.index)

    data_df_subset = data_df
    min_amount_value = np.min(data_df['Amount'])
    max_amount_value = np.max(data_df['Amount'])

    normalized_amounts = (data_df['Amount']-min_amount_value)/(max_amount_value - min_amount_value)
    data_df_subset['Amount']=normalized_amounts

    print("min_amount_value:", min_amount_value)
    print("max_amount_value", max_amount_value)
    print("X_test['Amount']", X_test['Amount'])
    normalized_X_test_amount = (X_test['Amount']-min_amount_value)/(max_amount_value - min_amount_value)
    print("normalized_X_test_amount", normalized_X_test_amount)
    X_test['Amount']=normalized_X_test_amount
    data_df_subset=data_df_subset.drop(['Unnamed: 0'],axis=1)
    pd.DataFrame.to_csv(data_df_subset,'data/backuped_data/MedMal_backend_preprocessed.csv')
    return data_df_subset, X_test

def train_model(X_train, y_train):
    from sklearn.neighbors import KNeighborsClassifier
    from sklearn.metrics import accuracy_score, make_scorer
    from sklearn.model_selection import GridSearchCV
    import numpy as np

    param_grid = {'n_neighbors': np.arange(1, 21)}

    knn = KNeighborsClassifier()
    scoring = {'Accuracy': make_scorer(accuracy_score)}

    grid_search = GridSearchCV(knn, param_grid, scoring=scoring, refit='Accuracy', cv=5)
    grid_search.fit(X_train, y_train)

    best_k = grid_search.best_params_['n_neighbors']
    best_accuracy = grid_search.best_score_

    print("Best k-value:", best_k)
    print("Best Accuracy:", best_accuracy)

    best_knn_model = KNeighborsClassifier(n_neighbors=best_k)
    best_knn_model.fit(X_train, y_train)
    return best_knn_model

def predict_private_attorney(data_df, X_test):
    print("****** IN PREDICTIONS *******")
    print(data_df.head())
    print(X_test.head())
    print("X_test Amount 1 is:", X_test['Amount'])
    data_df_subset, X_test= preprocess_data(data_df, X_test)
    print("X_test 2 Amount is:", X_test['Amount'])
    print("****** IN PREDICTIONS AFTER PREPROCESSING *******")
    print(data_df.head())
    print(X_test.head())
    X = data_df_subset.drop(['Private Attorney','Marital Status','Age'], axis=1)
    y = data_df_subset["Private Attorney"]
    X_train, X_test_temp, y_train, y_test_temp = train_test_split(X, y, test_size=0.3, random_state=42)

    quantile_threshold = data_df_subset['Amount'].quantile(0.75)

    high_amount_check = X_test['Amount'].apply(lambda x: 1 if x >= quantile_threshold else 0)

    best_knn_model = train_model(X_train, y_train)
    y_pred = best_knn_model.predict(X_test_temp)

    model_accuracy = accuracy_score(y_test_temp, y_pred) *100
    if high_amount_check.any():
        print(X_test['Amount'], quantile_threshold)
        print(f"This is a HIGH CLAIM amount. \n\nWe are {model_accuracy: .2f}% sure that Private Attorney WILL BE involved. \n\n Please be mindful of the potential legal costs associated with this claim. \n\n You might have to allocate appropriate resources for thorough investigations, legal support, and expert analysis to streamline the claims process.")
        return f"This is a HIGH CLAIM amount. \n\nWe are {model_accuracy: .2f}% sure that Private Attorney WILL BE involved. \n\n Please be mindful of the potential legal costs associated with this claim. \n\n You might have to allocate appropriate resources for thorough investigations, legal support, and expert analysis to streamline the claims process."

    else:
        print(f"This is a LOW CLAIM amount. \n\nWe are {model_accuracy: .2f}% sure that Private Attorney WILL NOT BE involved.\n\nWhile this reduces the potential legal complexities, please ensure that the claim receives due attention according to your standard claims resolution process.")
        return f"This is a LOW CLAIM amount. \n\nWe are {model_accuracy: .2f}% sure that Private Attorney WILL NOT BE involved. \n\nWhile this reduces the potential legal complexities, please ensure that the claim receives due attention according to your standard claims resolution process."


from sklearn.model_selection import train_test_split
import pandas as pd
def encode_categorical(column):
    codes = pd.Categorical(column).codes

    mapping_dict = {str(category): code for category, code in zip(column, codes)}

    return codes, mapping_dict

def predict_claim_amount(data_df, X_test):
    from sklearn.metrics import mean_squared_error, r2_score
    data_df_encoded = data_df.copy()
    insurance_codes, insurance_mapping = encode_categorical(data_df['Insurance'])
    specialty_codes, specialty_mapping = encode_categorical(data_df['Specialty'])
    gender_codes, gender_mapping = encode_categorical(data_df['Gender'])
    data_df_encoded['Insurance'] = insurance_codes
    data_df_encoded['Specialty'] = specialty_codes
    data_df_encoded['Gender'] = gender_codes

    X_test_encoded = X_test.copy()
    X_test_encoded['Insurance'] = X_test_encoded['Insurance'].map(insurance_mapping).fillna(-1).astype(int)
    X_test_encoded['Specialty'] = X_test_encoded['Specialty'].map(specialty_mapping).fillna(-1).astype(int)
    X_test_encoded['Gender'] = X_test_encoded['Gender'].map(gender_mapping).fillna(-1).astype(int)
    data_df_encoded=data_df_encoded.drop(['Unnamed: 0'], axis=1)
    X = data_df_encoded.drop(['Amount', 'Private Attorney', 'Marital Status', 'Age'], axis=1)
    y = data_df_encoded['Private Attorney']
    X_train, X_test_temp, y_train, y_test_temp = train_test_split(X, y, test_size=0.3, random_state=42)

    random_forest = RandomForestRegressor(n_estimators=100, random_state=42)
    random_forest.fit(X_train, y_train)

    y_forest_pred = random_forest.predict(X_test_temp)
    pred_amount = y_forest_pred*(np.max(data_df['Amount'])-np.min(data_df['Amount']))+np.min(data_df['Amount'])
    mse = mean_squared_error(y_test_temp, y_forest_pred)

    r2 = r2_score(y_test_temp, y_forest_pred)
    print(f"Mean Squared Error (MSE): {mse:.4f}")
    print(f"R-squared (R2): {r2:.4f}")
    return f"The predicted Claim Amount based on the provided details is: ${pred_amount[0]:.2f}. \n\n Please check if your financial reserves are sufficient to ensure potential claim settlement, or if the patient's claim amount is on par with this estimated value. \n\n A major deviation from the estimated claim amount can be a sign of malpractice."
