import React, { useState } from 'react';

type Status = "Inquiry" | "Onboarding" | "Active" | "Churned";
const status_inquiry : Status = "Inquiry";
const status_onboard : Status = "Onboarding";
const status_active : Status = "Active";
const status_churned: Status = "Churned";

type FormData = {
firstName: string;
middleName: string;
lastName: string;
dateOfBirth: string;
status: Status;
address: string;
additionalFields: {[field : string] : string}
};

type UserFormProps = {};

export default function App (props: UserFormProps) {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        middleName: '',
        lastName: '',
        dateOfBirth: '',
        status: "Active",
        address: '',
        additionalFields: {}
    });

    const [additionalFieldNames, setAdditionalFieldNames]= React.useState<string[]>([]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
        ...formData,
        [name]: value,
        });
    };

    const addNewField = () => {
        let newFieldPrefix = "New Field";
        let num = 1;

        while ( newFieldPrefix + num in formData.additionalFields) {
            num += 1;
        }

        const fieldName : string = newFieldPrefix + num;

        setFormData({
            ...formData,
            additionalFields: {
                ...formData.additionalFields,
                [fieldName]: ""
            }
        });
        setAdditionalFieldNames([...additionalFieldNames, fieldName])
    }

    const deleteNewField = (index : number) => {
        const fieldName = additionalFieldNames[index];

        const fieldNameCopy = [...additionalFieldNames];
        fieldNameCopy.splice(index,1);
        setAdditionalFieldNames(fieldNameCopy);

        const formCopy = {...formData};
        delete formCopy.additionalFields[fieldName];
        setFormData(formCopy);
    }

    const changeAdditionalFieldName = (index : number, newFieldName : string) => {
        const currentFieldName = additionalFieldNames[index];
        const currentFieldValue = formData.additionalFields[currentFieldName];

        const copy = [...additionalFieldNames];
        copy[index] = newFieldName;
        setAdditionalFieldNames(copy);

        delete formData.additionalFields[currentFieldName];

        setFormData({
            ...formData,
            additionalFields: {
                ...formData.additionalFields,
                [newFieldName]: currentFieldValue
            }
        })
    }

    const changeAdditionalFieldValue = (index : number, fieldValue : string) => {
        const fieldName = additionalFieldNames[index];

        setFormData({
            ...formData,
            additionalFields: {
                ...formData.additionalFields,
                [fieldName]: fieldValue
            }
        })
    }

    const handleSubmit = () => {
        console.log(formData);
    };

    return (
        <div>
            <label>
            First Name:
            <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
            />
            </label>
            <br></br>

            <label>
            Middle Name:
            <input
                type="text"
                name="middleName"
                value={formData.middleName}
                onChange={handleInputChange}
            />
            </label>
            <br></br>

            <label>
            Last Name:
            <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
            />
            </label>
            <br></br>

            <label>
            Date of Birth:
            <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
            />
            </label>
            <br></br>

            <label>
            Status:
            <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
            >
                <option value={status_active}>{status_active}</option>
                <option value={status_churned}>{status_churned}</option>
                <option value={status_inquiry}>{status_inquiry}</option>
                <option value={status_onboard}>{status_onboard}</option>
            </select>
            </label>
            <br></br>

            <label>
            Address:
            <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
            />
            </label>
            <br></br>

            {
                additionalFieldNames.map( (value,index) => (
                    <div key={index}>
                        <input
                            type="text"
                            value={additionalFieldNames[index]}
                            onChange={(e) => changeAdditionalFieldName(index, e.target.value)}
                        />
                        :
                        <input
                            type="text"
                            value={formData.additionalFields[additionalFieldNames[index]]}
                            onChange={(e) => changeAdditionalFieldValue(index, e.target.value)}
                        />
                        <button onClick={() => deleteNewField(index)}>Delete</button>
                    </div>
                ))
            }

            <button onClick={addNewField}>Add Field</button>
            <button onClick={handleSubmit}>Submit</button>
        </div>
    );
}
