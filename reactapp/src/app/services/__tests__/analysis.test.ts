import { analysisService } from '../analysis'
import './intraday.mock';

//@ts-ignore
const intraday = global.intraday;

describe("analysis service", () => {

  it("find tops and bottoms", () => {
    // check if all components are rendered

    //@ts-ignore
    const result: any = analysisService.rw_extremes(intraday, 2)

    console.log(result);
    // console.log(result.tops);

    expect(result).not.toBeNull();
    expect(result.tops).toHaveLength(3);
    expect(result.bottoms).toHaveLength(2);
  });
});