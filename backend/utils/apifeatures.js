class ApiFeatures {
  constructor(query, queryStr) {
    this.query = query; //query is property in apiFeatures class
    this.queryStr = queryStr; //queryStr is property in apiFeatures class
  }

  // search bar
  search() {
    const keyword = this.queryStr.keyword
      ? {
          name: {
            $regex: this.queryStr.keyword, // regular expression mongo command
            $options: "i", //case insensitive(mongo db)
          },
        }
      : {};
    this.query = this.query.find({ ...keyword });
    return this;
  }
  //Filter
  filter() {
    const querycopy = { ...this.queryStr };

    //remove some fields for category
    const removeFields = ["keyword", "page", "limit"];
    removeFields.forEach((key) => delete querycopy[key]);

    // filter for price and rating
    let queryStr = JSON.stringify(querycopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`); // now it will handle greater /less values
    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  // how many product to show one single page
  pagination(resultPerPage) {
    const CurrentPage = Number(this.queryStr.page) || 1;
    const skip = resultPerPage * (CurrentPage - 1);
    this.query = this.query.limit(resultPerPage).skip(skip);
    return this;
  }
}

module.exports = ApiFeatures;
