import axios from "axios";
import dotenv, { config } from 'dotenv'


dotenv.config()

class GeoService{

    private apiUrl:string;

    constructor(){
        this.apiUrl=process.env.GEO_EXTERNAL_API!;
    }


    async getCountries():Promise<any>{
        try {
            const response = await axios.get(`${this.apiUrl}`)
           const countries=response.data.map((country:any)=>({
                 name:country.name.common,
                 flag:country.flags.png
           })).sort((a:any,b:any)=>a.name.localeCompare(b.name))
           return countries
            
        } catch (error:any) {
            console.log("error in fetching countries:",error.response ? error.response.data : error.message)
            throw new Error('error in fetching countries')
            
        }


        
    }


    async getLanguages():Promise<any>{
        try {
            const response = await axios.get(`${this.apiUrl}`)
            const languages =response.data.reduce((acc:string[],country:any)=>{
                if (country.languages) {
                    const langs = Object.values(country.languages) as string[]; 
                    return acc.concat(langs); 
                }
                return acc
            }, []);

            const additionalLanguages = ["Malayalam", "Tamil", "Hindi"];
    
         
            const allLanguages = Array.from(new Set([...languages, ...additionalLanguages]));


            allLanguages.sort((a,b)=>a.localeCompare(b))
            return allLanguages;
            
        } catch (error) {
            console.log("error in fetching languages:",error)
            throw new Error('error in fetching languages')
            
        }


        
    }

}

export default GeoService