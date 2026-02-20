import { 
  Model, 
  ProjectionType, 
  QueryFilter, 
  QueryOptions, 
  Types, 
  UpdateQuery, 
  PopulateOptions,
} from 'mongoose';

// Custom options type
export type FindOptions<T> = QueryOptions<T> & {
  populate?: string | PopulateOptions | (string | PopulateOptions)[];
};

export abstract class BaseRepository<T> {
  constructor(protected readonly model: Model<T>) {}

  // Helper method to handle populate
  protected applyPopulate<Q>(
    query: Q,
    populate?: string | PopulateOptions | (string | PopulateOptions)[]
  ): Q {
    if (!populate) return query;

    if (Array.isArray(populate)) {
      populate.forEach(p => {
        (query as any).populate(p);
      });
    } else {
      (query as any).populate(populate);
    }

    return query;
  }

  // ==================== CREATE ====================
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data);
  }

  async createMany(data: Partial<T>[]): Promise<T[]> {
    return this.model.insertMany(data) as Promise<T[]>;
  }

  // ==================== READ ====================
  async findOne(
    filter: QueryFilter<T>,
    projection?: ProjectionType<T>,
    options?: FindOptions<T>,
  ): Promise<T | null> {
    const { populate, ...queryOptions } = options || {};
    let query = this.model.findOne(filter, projection, queryOptions);
    
    query = this.applyPopulate(query, populate);
    
    return query;
  }

  async find(
    filter: QueryFilter<T> = {},
    projection?: ProjectionType<T>,
    options?: FindOptions<T>,
  ): Promise<T[]> {
    const { populate, ...queryOptions } = options || {};
    let query = this.model.find(filter, projection, queryOptions);
    
    query = this.applyPopulate(query, populate);
    
    return query;
  }

  async findById(
    id: string | Types.ObjectId,
    projection?: ProjectionType<T>,
    options?: FindOptions<T>,
  ): Promise<T | null> {
    const { populate,select, ...queryOptions } = options || {};
    let query = this.model.findById(id, projection, queryOptions);
    
    query = this.applyPopulate(query, populate);
    if(select){
      query = query.select(select);
    }
    
    return query;
  }

  async findAll(options?: FindOptions<T>): Promise<T[]> {
    return this.find({}, {}, options);
  }

  async count(filter: QueryFilter<T> = {}): Promise<number> {
    return this.model.countDocuments(filter);
  }

  async exists(filter: QueryFilter<T>): Promise<boolean> {
    const count = await this.model.countDocuments(filter).limit(1);
    return count > 0;
  }

  // ==================== UPDATE ====================
  async findOneAndUpdate(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
    options?: FindOptions<T>,
  ): Promise<T | null> {
    const { populate, ...queryOptions } = options || {};
    let query = this.model.findOneAndUpdate(
      filter, 
      update, 
      { new: true, ...queryOptions }
    );
    
    query = this.applyPopulate(query, populate);
    
    return query;
  }

  async findByIdAndUpdate(
    id: string | Types.ObjectId,
    update: UpdateQuery<T>,
    options?: FindOptions<T>,
  ): Promise<T | null> {
    const { populate, ...queryOptions } = options || {};
    let query = this.model.findByIdAndUpdate(
      id, 
      update, 
      { new: true, ...queryOptions }
    );
    
    query = this.applyPopulate(query, populate);
    
    return query;
  }

  async updateMany(
    filter: QueryFilter<T>,
    update: UpdateQuery<T>,
  ): Promise<{ matchedCount: number; modifiedCount: number }> {
    const result = await this.model.updateMany(filter, update);
    return {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
    };
  }

  // ==================== DELETE ====================
  async findByIdAndDelete(
    id: string | Types.ObjectId,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findByIdAndDelete(id, options);
  }

  async findOneAndDelete(
    filter: QueryFilter<T>,
    options?: QueryOptions<T>,
  ): Promise<T | null> {
    return this.model.findOneAndDelete(filter, options);
  }

  async deleteMany(filter: QueryFilter<T>): Promise<{ deletedCount: number }> {
    const result = await this.model.deleteMany(filter);
    return { deletedCount: result.deletedCount };
  }

  // ==================== PAGINATION ====================
  async paginate(
    filter: QueryFilter<T> = {},
    options: {
      page?: number;
      limit?: number;
      sort?: string | Record<string, 1 | -1>;
      projection?: ProjectionType<T>;
      populate?: string | PopulateOptions | (string | PopulateOptions)[];
      select?: string;
    } = {},
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  }> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.max(1, options.limit || 10);
    const skip = (page - 1) * limit;

    const { populate, projection, sort, select } = options;

    let query = this.model
      .find(filter, projection, { select })
      .skip(skip)
      .limit(limit);

    if (sort) {
      query = query.sort(sort);
    }

    query = this.applyPopulate(query, populate);

    const [data, total] = await Promise.all([
      query.exec(),
      this.count(filter),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };
  }

  // ==================== AGGREGATION ====================
  async aggregate<R = any>(pipeline: any[]): Promise<R[]> {
    return this.model.aggregate(pipeline);
  }


}