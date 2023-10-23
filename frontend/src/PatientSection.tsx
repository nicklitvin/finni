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

    const makePatientSection = (patient : PatientData) => {
        const typesList = patient.types == null ? [] : patient.types.split(",");
        const typeValueList = patient.type_values == null ? [] : patient.type_values.split(",");
        const combinedList = typesList.map( (value,index) => [value, typeValueList[index]]);

        return (
            <div>
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
                <p>============================</p>
            </div>
        )
    }

    return (
        <div>
            <h1>Patient Data</h1>
            {data.map( (patient) => makePatientSection(patient))}
        </div>
    )
}