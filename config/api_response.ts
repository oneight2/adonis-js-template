export default class ApiResponse {
  static success(message: string, data: any = {}, meta: any = {}) {
    return {
      meta: {
        success: true,
        message,
        ...meta,
      },
      data,
    }
  }

  static error(message: string, trace: any = null, data: any = {}) {
    return {
      meta: {
        success: false,
        message,
        trace,
      },
      data,
    }
  }

  static paginate(message: string, pagination: any) {
    const { meta, data } = pagination.toJSON()

    return {
      meta: {
        success: true,
        message,
        pagination: {
          total: meta.total,
          perPage: meta.perPage,
          currentPage: meta.currentPage,
          lastPage: meta.lastPage,
          firstPage: meta.firstPage,
          firstPageUrl: meta.firstPageUrl,
          lastPageUrl: meta.lastPageUrl,
          nextPageUrl: meta.nextPageUrl,
          previousPageUrl: meta.previousPageUrl,
        },
      },
      data,
    }
  }
}
