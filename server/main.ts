import express from "express";
import * as mysql from "mysql2";
import dotenv from "dotenv";
import { Pool as PromisePool } from 'mysql2/promise';

type Status = "Inquiry" | "Onboarding" | "Active" | "Churned";
const status_inquiry : Status = "Inquiry";
const status_onboard : Status = "Onboarding";
const status_active : Status = "Active";
const status_churned: Status = "Churned";

const db_basic_info = "basic";
const db_extra_info = "extra";

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
        create table if not exists ${db_basic_info}
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
        create table if not exists ${db_extra_info}
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
    }
}

const manager = new dbManger();

manager.setupTables();

// const app = express();
// app.use(express.json());
// const port = 3000;



// const urlCreatePatient = "/createPatient";

// app.post(urlCreatePatient, (req,res) => {
//     try {
//         const command = req.body; 

//     } catch (err) {
//         console.log(err);
//     }
// })

// app.listen(port);