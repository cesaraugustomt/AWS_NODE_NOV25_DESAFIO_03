import { CarsRepository } from '../../../domain/repositories/CarsRepository';
import Car from '../../../domain/entities/Car';
import { IShowCar } from './ShowCarService';
import { ListCarParams } from '../../params/ListCarsParams.type';

export interface IPaginateCar {
  per_page: number;
  total: number;
  current_page: number;
  data: (IShowCar | Car)[];
}

export class ListCarService {
  constructor(
    private CarsRepository: CarsRepository
  ) { }

  public async execute(listParams: ListCarParams): Promise<IPaginateCar> {
    listParams.items = listParams.items?.slice(0, 5);

    let cars = await this.CarsRepository.findAll(listParams);

    cars.data = (cars.data as Car[]).map((car: Car) => {
      const { items, deletedAt, ...info_car } = car;
      const ret_car: IShowCar = { ...info_car, items: items.map(item => item.name) };
      return ret_car;
    });

    return cars;
  }
}

export default ListCarService;
