import { analysisService } from '../analysis'
import { intraday } from './intraday.mock';
import { writeFileSync } from 'fs';

generateIMock();

describe("analysis service", () => {

  it("find tops and bottoms", () => {
    // check if all components are rendered

    //@ts-ignore
    const result: any = analysisService.rw_extremes(intraday, 2)

    const toposEFundos = result.tops.concat(result.bottoms).sort((x, y) => {
      if (x.index < y.index)
        return -1;

      if (x.index > y.index)
        return 1;

      return 0;
    }) as any[];

    const toposEFundosCompleto = toposEFundos.reduce(((previous, next) => {
      if (previous[previous.length - 1]?.type != next.type) {
        previous.push(next);
      }

      return previous;
    }), [] as any[]);

    console.log(toposEFundosCompleto);

    generateTFMock(toposEFundosCompleto);

    // console.log(result.tops);

    expect(result).not.toBeNull();
    expect(toposEFundosCompleto.filter(x => x.type == "TOPO")).toHaveLength(3);
    expect(toposEFundosCompleto.filter(x => x.type == "FUNDO")).toHaveLength(3);
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
