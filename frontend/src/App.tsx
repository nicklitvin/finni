import React from "react";
import PatientForm, { FormData, emptyForm } from "./PatientForm";
import PatientSection from "./PatientSection";

export default function App() {
    const [addForm, setAddForm] = React.useState<FormData>(emptyForm);
    const [editForm, setEditForm] = React.useState<FormData>(emptyForm);

    return (
        <>
            <PatientForm formData={addForm} setFormData={setAddForm} edit={false}/>
            <PatientForm formData={editForm} setFormData={setEditForm} edit={true}/>
            <PatientSection setEditFormData={setEditForm}/>
        </>
    )
}