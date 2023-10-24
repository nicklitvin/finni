import React from "react";
import { FormData } from "./PatientForm";

interface Props {
    setEditFormData : Function
}

export default function PatientSection( {setEditFormData} : Props ) {
    const [data, setData] = React.useState<FormData[]>([]);
    const [field, setField] = React.useState("");
    const [value, setValue] = React.useState("");
    const [filterError, setFilterError] = React.useState("");

    React.useEffect( () => {
        const func = async () => {
            try {
                const serverData = await fetch("http://localhost:3001/getPatients");
                const jsonData = ( await serverData.json() ) as FormData[];
                setData(jsonData);
            } catch (err) {
                console.log(err);
            }
        }
        func();
    },[])

    const deletePatient = async (patient_id : string) => {
        try {
            const delete_request : RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    patient_id: patient_id
                })
            };

            const response = await fetch("http://localhost:3001/deletePatient", delete_request);
            if (response.status === 200) {
                setData( data.filter( (patient) => patient.patientId !== patient_id))
            }

        } catch (err) {
            console.log(err);
        }
    }

    const makePatientSection = (patient : FormData) => {
        return (
            <div key={`patient-${patient.patientId}`}>
                <p>{`First Name: ${patient.firstName}`}</p>
                <p>{`Middle Name: ${patient.middleName}`}</p>
                <p>{`Last Name: ${patient.lastName}`}</p>
                <p>{`Status: ${patient.status}`}</p>
                <p>{`Birthday: ${patient.dateOfBirth}`}</p>
                <p>Addresses</p>
                <ul>
                {patient.addresses.map( (value, index) => 
                    <li key={`address-${index}`}>{value}</li>  
                )}
                </ul>
                {Object.keys(patient.additionalFields).map( (value,index) => 
                    <p key={`other-${index}`}>{`${value}: ${patient.additionalFields[value]}`}</p>
                )}
                <button onClick={() => deletePatient(patient.patientId as string)}>Delete Patient</button>
                <button onClick={() => setEditFormData(patient)}>Edit Patient</button>
                <p>============================</p>
            </div>
        )
    }

    const makeFilterSearch = async () => {
        try {
            const data : {[key: string] : string} = {
                field: field,
                value: value
            }
            const request : RequestInit = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            }
            const response = await fetch(`http://localhost:3001/queryPatient`, request);
            const patientData = (await response.json()) as FormData[];
            setData(patientData);
        } catch (err) {
            setFilterError("bad filter request");
        }
    }

    return (
        <div>
            <h1>Patient Data</h1>
            <div>
                <input placeholder="field" onChange={(e) => setField(e.target.value)} value={field}/>
                <input placeholder="value" onChange={(e) => setValue(e.target.value)} value={value}/>
                <br></br>
                <p>{filterError}</p>
                <br></br>
                <button onClick={makeFilterSearch}>Search</button>
            </div>
            {data.map( (patient) => makePatientSection(patient))}
        </div>
    )
}