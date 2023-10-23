import express from "express";
import * as mysql from "mysql2";
import dotenv from "dotenv";
import { Pool as PromisePool } from 'mysql2/promise';
import crypto from "crypto";
import cors from "cors";

type Status = "Inquiry" | "Onboarding" | "Active" | "Churned";
const status_inquiry : Status = "Inquiry";
const status_onboard : Status = "Onboarding";
const status_active : Status = "Active";
const status_churned: Status = "Churned";

const db_basic = "basic";
const db_extra = "extra";

const column_patient_id = "patient_id";
const column_first_name = "first";
const column_middle_name = "middle";
const column_last_name = "last";
const column_birthday = "birthday";
const column_status = "status";

const column_data_type = "data_type";
const column_data_value = "data_value";

const varchar = "varchar(255)";

type FormData = {
    firstName: string;
    middleName: string;
    lastName: string;
    dateOfBirth: string;
    status: Status;
    addresses: string[];
    additionalFields: {[field : string] : string}
};

class dbManger {
    pool: PromisePool;

    constructor() {
        dotenv.config();

        this.pool = mysql.createPool({
            host: process.env.HOST,
            user: process.env.USER,
            password: process.env.PASSWORD,
            database: process.env.DATABASE
        }).promise();
    }

    async setupTables() {
        const db_basic_setup = 
        `
        create table if not exists ${db_basic}
        (
            ${column_patient_id} ${varchar},
            ${column_first_name} ${varchar},
            ${column_middle_name} ${varchar},
            ${column_last_name} ${varchar},
            ${column_birthday} ${varchar},
            ${column_status} ${varchar}
        )
        `;

        const db_extra_setup = 
        `
        create table if not exists ${db_extra}
        (
            ${column_patient_id} ${varchar},
            ${column_data_type} ${varchar},
            ${column_data_value} ${varchar}
        )
        `;

        await this.runQuery(db_basic_setup);
        await this.runQuery(db_extra_setup);
        console.log("setup tables")
    }

    async runQuery(command : string) {
        const [rows, fields] = await this.pool.query(command);
        return rows;
    }

    async createPatient(patientData : FormData) {
        const patient_id = crypto.randomUUID();

        const basic_command = 
        `
        insert into ${db_basic} 
        (
            ${column_patient_id},
            ${column_first_name},
            ${column_middle_name},
            ${column_last_name},
            ${column_status},
            ${column_birthday}
        )
        values 
        (
            '${patient_id}', 
            '${patientData.firstName}', 
            '${patientData.middleName}',
            '${patientData.lastName}', 
            '${patientData.status}', 
            '${patientData.dateOfBirth}'
        )
        `;

        const make_extra_insert = (id : string, data_type: string, data_value : string) => {
            return (
                `
                insert into ${db_extra}
                (
                    ${column_patient_id},
                    ${column_data_type},
                    ${column_data_value}
                )
                values
                ( '${id}', '${data_type}', '${data_value}')
                `
            )
        }
        await this.runQuery(basic_command);

        for (let address of patientData.addresses) {
            const address_command = make_extra_insert(patient_id, "address", address);
            await this.runQuery(address_command);
        }

        for (let extra of Object.entries(patientData.additionalFields)) {
            const extra_command = make_extra_insert(patient_id, extra[0], extra[1]);
            await this.runQuery(extra_command);
        }
    }

    async getAllPatientInfo() {
        const type_alias = "types";
        const value_alias = "type_values";

        const patients = await this.runQuery(
            `
            select
                ${db_basic}.${column_patient_id},
                ${db_basic}.${column_first_name},
                ${db_basic}.${column_middle_name},
                ${db_basic}.${column_last_name},
                ${db_basic}.${column_status},
                ${db_basic}.${column_birthday},
                group_concat(${db_extra}.${column_data_type}) as ${type_alias},
                group_concat(${db_extra}.${column_data_value}) as ${value_alias} 
            from ${db_basic} 
            left join ${db_extra} on 
                ${db_basic}.${column_patient_id} = ${db_extra}.${column_patient_id}
            group by 
                ${db_basic}.${column_patient_id},
                ${db_basic}.${column_first_name},
                ${db_basic}.${column_middle_name},
                ${db_basic}.${column_last_name},
                ${db_basic}.${column_status},
                ${db_basic}.${column_birthday}
            `
        )
        return patients;
    }
}

const manager = new dbManger();
// manager.getAllPatientInfo();

// manager.setupTables();

// const ex : FormData = {
//     firstName: "12",
//     middleName: "23",
//     lastName: "3",
//     dateOfBirth: "01/01/2001",
//     addresses: ["one"],
//     status: "Active",
//     additionalFields: {
//     }
// };
// manager.createPatient(ex);


const app = express();
app.use(cors());
app.use (express.json());
const port = 3001;

const urlCreatePatient = "/createPatient";
const urlGetPatients = "/getPatients";

app.post(urlCreatePatient, async (req,res) => {
    try {
        const patientData = req.body as FormData; 
        console.log("reeceived",patientData);
        await manager.createPatient(patientData);
        res.status(200).send()

    } catch (err) {
        res.status(400).send();
    }
})

app.get(urlGetPatients, async (req,res) => {
    try {
        const data = await manager.getAllPatientInfo();
        console.log(data);
        res.send(data);
    } catch (err) {
        res.status(404).send();
    }
})

app.listen(port);
console.log("server running");
