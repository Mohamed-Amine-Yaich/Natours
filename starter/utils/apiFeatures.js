class apiFeatures {
  //query string :req.query
  //query : mongoose query

  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObject = { ...this.queryString };

    const excludedQuery = ['page', 'limit', 'sort', 'fields'];
    excludedQuery.forEach((element) => {
      delete queryObject[element];
    });

    let queryStr = JSON.stringify(queryObject);

    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    console.log('filter');
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');

      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-price');
    }
    console.log('sort');

    return this;
  }

  fields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v'); // - to exclude this field from data that will be recived by the client
    }
    console.log('fields');

    return this;
  }
  paging() {
    const page = this.queryString.page * 1 || 1; //multiply to convert string to number and ||1 page 1 by default
    const limit = this.queryString.limit * 1 || 9;
    const skip = limit * (page - 1);
    this.query = this.query.skip(skip).limit(limit);
    console.log('paging');

    return this;
  }
}
module.exports = apiFeatures
