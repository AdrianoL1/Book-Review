import pg from 'pg';
import 'dotenv/config'

const DB_USER = process.env.DB_USER || 'postgres';
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_NAME = "dbBookReviews";
const DB_PASSWORD = process.env.DB_PASSWORD || 'root';

async function setupDB(){
    const client = new pg.Client({
        user: DB_USER,
        host: DB_HOST,
        password: DB_PASSWORD,
        port: 5432
    });

    //CREATE DB
    await client.connect()
    .then(() => {
        client.query(`CREATE DATABASE "${DB_NAME}"`, (err, res) => {
            if(err){
                console.log(`Query error: ${err.message}`);
            }else{
                console.log("DB successfully created!");
            }
            client.end().then(() => {
                //CREATE TABLE
                const newClient = new pg.Client({
                    user: DB_USER,
                    host: DB_HOST,
                    database: DB_NAME,
                    password: DB_PASSWORD,
                    port: 5432
                });
            
                newClient.connect()
                .then(() => {
                    newClient.query(`
                        CREATE SEQUENCE IF NOT EXISTS "books_id_seq";
                        CREATE TABLE IF NOT EXISTS public.books
                        (
                            id integer NOT NULL DEFAULT nextval('books_id_seq'::regclass),
                            title character varying(255) COLLATE pg_catalog."default" NOT NULL,
                            review text COLLATE pg_catalog."default" NOT NULL,
                            rating double precision NOT NULL,
                            cover bytea NOT NULL,
                            description character varying(510) COLLATE pg_catalog."default" NOT NULL DEFAULT 'Book Description'::character varying,
                            CONSTRAINT books_pkey PRIMARY KEY (id),
                            CONSTRAINT rating_range CHECK (rating >= 0::double precision AND rating <= 10::double precision)
                        )

                        TABLESPACE pg_default;

                        ALTER TABLE IF EXISTS public.books
                            OWNER to postgres;
                        `, (err, res) => {
                        if(err){
                            console.log(`Create table query error: ${err.message}`);
                        }else{
                            console.log("Table successfully created!");
                        }
                        newClient.end()
                    })
                })
                .catch((err) => {
                    console.log(`New client connect error: ${err.message}`);
                    newClient.end();
                })
            })
            .catch((err) => {console.log(err.message);})
        })
    })
    .catch((err) => {
        console.log(`Connect error: ${err}`);
        client.end();
    })
}

await setupDB();