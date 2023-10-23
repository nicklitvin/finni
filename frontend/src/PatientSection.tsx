import React from "react";

interface PatientData {
    patient_id: string,
    first: string,
    middle: string,
    last: string,
    status: string,
    birthday: string,
    types: string,
    type_values: string
}

export default function PatientSection() {
    const [data, setData] = React.useState<PatientData[]>([]);
    const [field, setField] = React.useState("");
    const [value, setValue] = React.useState("");
    const [filterError, setFilterError] = React.useState("");

    React.useEffect( () => {
        const func = async () => {
            try {
                const serverData = await fetch("http://localhost:3001/getPatients");
                const jsonData = ( await serverData.json() ) as PatientData[];
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
                setData( data.filter( (patient) => patient.patient_id !== patient_id))
            }

        } catch (err) {
            console.log(err);
        }
    }

    const makePatientSection = (patient : PatientData) => {
        const typesList = patient.types == null ? [] : patient.types.split(",");
        const typeValueList = patient.type_values == null ? [] : patient.type_values.split(",");
        const combinedList = typesList.map( (value,index) => [value, typeValueList[index]]);

        return (
            <div key={`patient-${patient.patient_id}`}>
                <p>{`First Name: ${patient.first}`}</p>
                <p>{`Middle Name: ${patient.middle}`}</p>
                <p>{`Last Name: ${patient.last}`}</p>
                <p>{`Status: ${patient.status}`}</p>
                <p>{`Birthday: ${patient.birthday}`}</p>
                <p>Addresses</p>
                <ul>
                {combinedList.map( (value, index) => 
                    value[0] === "address" ? 
                    <div key={`address${index}`}>
                        <li>{value[1]}</li>  
                        <br></br>
                    </div> :
                    null
                )}
                </ul>
                {combinedList.map( (value, index) => 
                    value[0] !== "address" ? 
                    <div key={`otherfield${index}`}>
                        <p>{`${value[0]}: ${value[1]}`}</p>
                        <br></br>
                    </div> :
                    null
                )}
                <button onClick={() => deletePatient(patient.patient_id)}>Delete Patient</button>
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
            const patientData = (await response.json()) as PatientData[];
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