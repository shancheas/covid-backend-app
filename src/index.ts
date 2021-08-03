import express, { Application, Request, Response, NextFunction } from 'express'
import { CaseController, CaseProxy } from './data';
import cases from './data/cases.json'

const port = process.env.APP_PORT
const app: Application = express();

export const countries = () => {
    return Object.keys(cases)
}


const hello = (_: Request, res: Response) => {
    const response = countries()

    res.send(response);
}

const covid = ({ query }: Request, res: Response) => {
    const { date, country } = query
    const controller = new CaseController()
    const proxy = new CaseProxy(controller)

    if (!country) {
        return res.send(proxy.allCountry(date as string))
    }

    return res.send(proxy.perCountry(country as string, date as string))
}

app.get('/', covid);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500).send({
        message: err.message
    })
})

app.listen(port);