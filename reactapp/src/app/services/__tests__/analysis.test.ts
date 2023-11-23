import { analysisService } from '../analysis'
import { intraday } from './intraday.mock';
import { writeFileSync } from 'fs';

generateIMock();

describe("analysis service", () => {

  it("run", () => {
    // check if all components are rendered

    //@ts-ignore
    const result: any = analysisService.run(intraday, new Date(2023, 1, 10).toISOString(), new Date(2023, 20, 10).toISOString())

    // console.log(result.tops);

    expect(result).not.toBeNull();
    expect(result.filter(x => x.type == "TOPO")).toHaveLength(4);
    expect(result.filter(x => x.type == "FUNDO")).toHaveLength(4);
  });


  it("find tops and bottoms", () => {
    // check if all components are rendered

    //@ts-ignore
    const result: any = analysisService.toposEFundos(intraday, 2)

    generateTFMock(result);

    // console.log(result.tops);

    expect(result).not.toBeNull();
    expect(result.filter(x => x.type == "TOPO")).toHaveLength(4);
    expect(result.filter(x => x.type == "FUNDO")).toHaveLength(4);
  });
});

function generateIMock() {
  if (process.env.DASH_HABILITA_GENERATED_MOCK !== "false")
    writeFileSync('./src/app/services/__tests__/intraday.generatedmock.js', `window.intraday = ${JSON.stringify(intraday)}`);
}

function generateTFMock(toposEFundosCompleto: any) {
  if (process.env.DASH_HABILITA_GENERATED_MOCK !== "false")
    writeFileSync('./src/app/services/__tests__/topos_e_fundos.generatedmock.js', `window.toposEFundos = ${JSON.stringify(toposEFundosCompleto)}`);
}
