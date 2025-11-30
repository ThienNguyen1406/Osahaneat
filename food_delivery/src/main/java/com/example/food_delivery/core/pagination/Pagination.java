package com.example.food_delivery.core.pagination;

import lombok.Data;

@Data
public class Pagination {
    private int page;
    private int pageSize;
    private int nextPage;
    private int prevPage;
    private int total;
}
