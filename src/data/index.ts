import * as cases from './cases.json'
import * as positive from './confirmed.json'
import * as recovered from './recovered.json'
import * as deaths from './deaths.json'
import countries from './countries.json'

interface Case {
    total(): number
    byDate(date: string): number
}

interface CaseCount {
    confirmed: number;
    recovered: number;
    deaths: number;
}

interface CaseInterface extends CaseCount {
    country: string;
    population: number;
    sq_km_area: number;
    life_expectancy: string;
    continent: string;
    abbreviation: string;
    location: string;
    iso: number;
    capital_city: string;
    dates? : any
}

abstract class AbstractCase implements Case {
    protected cases: CaseInterface
    constructor(
        private readonly data: CaseInterface,
        private readonly country: string = 'Global'
    ) {
        const countryCase = cases as any;
        this.cases = countryCase[country]['All']
    }

    byDate(date: string): number {
        console.log(this.data)
        return this.data.dates[date] ?? 0
    }

    abstract total(): number

}

class PositiveCase extends AbstractCase {
    total(): number {
        return this.cases.confirmed
    }
}

class RecoverCase extends AbstractCase {
    total(): number {
        return this.cases.recovered
    }
}

class DeathsCase extends AbstractCase {
    total(): number {
        return this.cases.deaths
    }
}

interface CovidFactory {
    createCasePosive(): Case
    createCaseRecover(): Case
    createCaseDeath(): Case
}

class CovidFactoryImpl implements CovidFactory {
    
    constructor(
        private readonly country = 'Global'
    ){}

    createCasePosive(): Case {
        const cases = positive as any;
        const positiveCase = cases[this.country]['All']
        return new PositiveCase(positiveCase, this.country)
    }

    createCaseRecover(): Case {
        const cases = recovered as any;
        const recoveredCase = cases[this.country]['All']
        return new RecoverCase(recoveredCase, this.country)
    }

    createCaseDeath(): Case {
        const cases = deaths as any;
        const deathsCase = cases[this.country]['All']
        return new DeathsCase(deathsCase, this.country)
    }
}

class CaseBuilder {
    private date: string | undefined;

    private covidFactory = new CovidFactoryImpl();

    setCountry(country: string) {
        this.covidFactory = new CovidFactoryImpl(country);
        return this
    }

    setDate(date: string | undefined) {
        this.date = date
        return this
    }

    caseCount(cases: Case) {
        return this.date ? cases.byDate(this.date) : cases.total()
    }

    case(): CaseCount {
        const cases = {
            confirmed: this.caseCount(this.covidFactory.createCasePosive()),
            deaths: this.caseCount(this.covidFactory.createCaseDeath()),
            recovered: this.caseCount(this.covidFactory.createCaseRecover()),
        }

        return this.date ? Object.assign(cases, { date: this.date }) : cases
    }

    execute(): CaseCount {
        return this.case()
    }
}

interface Controller {
    allCountry(date?: string): CaseCount
    perCountry(country: string, date?: string): CaseCount
}

export class CaseController implements Controller {
    private builder = new CaseBuilder()

    allCountry(date?: string): CaseCount {
        return this.builder.setDate(date).execute()
    }

    perCountry(country: string, date?: string): CaseCount {
        return this.builder.setDate(date).setCountry(country).execute()
    }

}

export class CaseProxy implements Controller {
    private countries: string[] = countries as string[]

    constructor(
        private readonly controller: CaseController
    ) {}

    allCountry(date?: string): CaseCount {
        if (!this.isValidDateFormat(date)) {
            throw new Error('Date format is invalid')
        }

        return this.controller.allCountry(date)
    }

    perCountry(country: string, date?: string): CaseCount {
        if (!this.isValidDateFormat(date)) {
            throw new Error('Date format is invalid')
        }

        if (!this.isCountryAvailable(country)) {
            throw new Error(`Country ${country} not available`)
        }

        return this.controller.perCountry(country, date)
    }

    private isValidDateFormat(date?: string): boolean {
        if (!date) return true

        //TODO: validate date format
        return true;
    }

    private isCountryAvailable(country = 'Global'): boolean {
        return this.countries.includes(country)
    }

}