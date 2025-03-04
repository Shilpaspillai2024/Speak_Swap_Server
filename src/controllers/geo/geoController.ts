import { Request,Response } from "express";
import IGeoService from "../../services/interfaces/geo/igeoService";
import {HttpStatus} from '../../constants/httpStatus'
import { MESSAGES } from "../../constants/message";

class GeoController{
    private geoService:IGeoService;


    constructor(geoService:IGeoService){
        this.geoService=geoService;
    }



    async getCountries(req:Request,res:Response):Promise<void>{
        try {

            const countries=await this.geoService.getCountries()
            res.status(HttpStatus.OK).json(countries)
            
        } catch (error) {

            let errorMessage = MESSAGES.UNEXPECTED_ERROR;
            if (error instanceof Error) {
              errorMessage = error.message;
            }
            res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
          }
            
        }




        async getLanguages(req:Request,res:Response):Promise<void>{
            try {
    
                const languages=await this.geoService.getLanguages()
                res.status(HttpStatus.OK).json(languages)
                
            } catch (error) {
    
                let errorMessage = MESSAGES.UNEXPECTED_ERROR;
                if (error instanceof Error) {
                  errorMessage = error.message;
                }
                res.status(HttpStatus.BAD_REQUEST).json({ error: errorMessage });
              }
                
            }

        
        
}

export default GeoController
