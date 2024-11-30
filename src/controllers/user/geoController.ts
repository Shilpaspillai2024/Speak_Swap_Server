import { Request,Response } from "express";
import GeoService from "../../services/user/geoService";

class GeoController{
    private geoService:GeoService;


    constructor(geoService:GeoService){
        this.geoService=geoService;
    }



    async getCountries(req:Request,res:Response):Promise<void>{
        try {

            const countries=await this.geoService.getCountries()
            res.status(200).json(countries)
            
        } catch (error) {

            let errorMessage = 'An unexpected error occurred';
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            res.status(400).json({ error: errorMessage });
          }
            
        }




        async getLanguages(req:Request,res:Response):Promise<void>{
            try {
    
                const languages=await this.geoService.getLanguages()
                res.status(200).json(languages)
                
            } catch (error) {
    
                let errorMessage = 'An unexpected error occurred';
                if (error instanceof Error) {
                  errorMessage = error.message;
                }
                res.status(400).json({ error: errorMessage });
              }
                
            }

        
        
}

export default GeoController
