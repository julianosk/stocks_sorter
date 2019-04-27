import { Component, ViewChild } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {StockService} from '../../services/stock.service';
import {Stock} from '../../../Stock';
import {StockDialogComponent} from '../stock-dialog/stock-dialog.component';
import {Filter, Indicator, defaultFilters, indicators, operators, Operator} from '../../data-model';

@Component({
  moduleId: module.id,
  selector: 'stocks',
  templateUrl: 'stocks.component.html',
  styleUrls: ['stocks.component.css']
})

export class StocksComponent {
  allStocks: Stock[];
  stocks: Stock[];
  title: string;
  indicators = indicators;
  operators = operators;
  filters: Array<{}>;
  filterList: Array<{}>;
  orderBy: string[];
  columns: Array<{prop: string, order: string}>;
  columnClasses: {};
  @ViewChild('stockDialog') stockDialog: StockDialogComponent;
  showSidebar: boolean;
  indicatorsKeys;


  constructor(private stockService:StockService){
    this.indicatorsKeys = this.operators.list;
    this.stockService.getStocks()
      .subscribe(stocks => {
        this.allStocks = stocks;
        this.stocks = JSON.parse(JSON.stringify(this.allStocks));//Object.assign({}, this.allStocks);
        this.applyDefaultFilter();
      });
  }

  filterTable(filters: Filter[]) {
    console.log("filterTable = " + filters);
    console.log(JSON.stringify(filters));
    this.filterStocks2(filters)
  }

  showStockDialog(stock : Stock) {
    console.log("showStockDialog + "+stock.name);
    this.stockDialog.show(stock);
  }

  applyDefaultFilter() {
    console.log("applyDefaultFilter + ");
    this.columnClasses = {
      'none': 'glyphicon glyphicon-sort',
      'asc': 'glyphicon glyphicon-sort-by-attributes',
      'desc': 'glyphicon glyphicon-sort-by-attributes-alt'
    };

    this.filters = [];
    this.filters.push({
      prop: 'pl',
      min: 1,
      max: 20
    });
    this.filters.push( {
      prop: 'roe',
      min: 0
    });
    this.filters.push( {
      prop: 'pvp',
      min: 0,
      max: 10
    });
    this.filters.push({
      prop: 'liqcorr',
      min: 1,
    });
    this.filters.push({
      prop: 'mrgebit',
      min: 0
    });
    this.filters.push({
      prop: 'crescrec5a',
      min: 5
    });
    this.filters.push({
      prop: 'liq2mes',
      min: 100000
    });
    this.filterList = [];
    this.filterList.push({
      prop: 'pl',
      operator: 'gte',
      value: 1
    });
    this.filterList.push({
      prop: 'pl',
      operator: 'lte',
      value: 20
    });
    this.filterList.push({
      prop: 'roe',
      operator: 'gte',
      value: 0
    });
    this.filterList.push({
      prop: 'pvp',
      operator: 'gte',
      value: 0
    });
    this.filterList.push({
      prop: 'pvp',
      operator: 'lte',
      value: 10
    });
    this.filterList.push({
      prop: 'liqcorr',
      operator: 'gte',
      value: 1
    });
    this.filterList.push({
      prop: 'mrgebit',
      operator: 'gte',
      value: 0
    });
    this.filterList.push({
      prop: 'crescrec5a',
      operator: 'gte',
      value: 5
    });
    this.filterList.push({
      prop: 'liq2mes',
      operator: 'gte',
      value: 100000
    });
    this.orderBy = [];
    this.orderBy.push('pl');
    this.orderBy.push('evebit');
    this.orderBy.push('crescrec5a');
    this.orderBy.push('divyield');
    this.columns = Array<{prop: string, order: string}>();
    this.columns.push({
      prop: 'sum',
      order: 'asc'
    });
    this.columns.push({
      prop: 'pl',
      order: 'none'
    });
    this.columns.push({
      prop: 'crescrec5a',
      order: 'none'
    });
    this.columns.push({
      prop: 'divyield',
      order: 'none'
    });
    this.columns.push({
      prop: 'price',
      order: 'none'
    });
    // this.filterStocks();
    this.filterStocksWithAnalysis();
    this.sortStocks();
    console.log('Loaded')
  }
  filterStocks2(filters: Filter[]) {
    this.stocks = [];
    for (let i in this.allStocks){
      let stock = this.allStocks[i];
      let toAdd = true;
      for (let j in filters) {
        let filter = filters[j];
        switch (filter.operator) {
          case operators.eq.code: {
            if (stock[filter.indicator] != filter.value) {
              toAdd = false;
            }
            break;
          }
          case operators.gt.code: {
            if (stock[filter.indicator] <= filter.value) {
              toAdd = false;
            }
            break;
          }
          case operators.gte.code: {
            if (stock[filter.indicator] < filter.value) {
              toAdd = false;
            }
            break;
          }
          case operators.lt.code: {
            if (stock[filter.indicator] >= filter.value) {
              toAdd = false;
            }
            break;
          }
          case operators.lte.code: {
            if (stock[filter.indicator] > filter.value) {
              toAdd = false;
            }
            break;
          }
        }
      }
      if (toAdd) {
        stock['sum'] = 0;
        this.stocks.push(stock);
      }
    }
    console.log(`filterStocks end total = ${this.stocks.length}`);
  }
  filterStocks() {
    console.log("Filter Stocks");
    this.stocks = [];
    for (let i in this.allStocks){
      let stock = this.allStocks[i];
      let toAdd = true;
      for (let j in this.filters) {
        let filter = this.filters[j];
        // console.log("Stock: = "+stock.name);
        // console.log("prop = "+filter['prop']+" min = " + filter['min']);
        if (filter['min']) {
          if (stock[filter['prop']] <= filter['min']) {
            toAdd = false;
            break;
          }
        }
        if (filter['max']) {
          if (stock[filter['prop']] >= filter['max']) {
            toAdd = false;
            break;
          }
        }
      }
      if (toAdd) {
        stock['sum'] = 0;
        this.stocks.push(stock);
      }
    }
    console.log(`filterStocks end total = ${this.stocks.length}`);
  }
  filterStocksWithAnalysis() {
    console.log("filterStocksWithAnalysis");
    this.stocks = [];
    for (let i in this.allStocks){
      let stock = this.allStocks[i];
      if (stock['analysis']) {
        stock['sum'] = 0;
        this.stocks.push(stock);
      }
    }
    console.log(`filterStocksWithAnalysis end total = ${this.stocks.length}`);
  }
  sortStocks() {
    console.log("sortStocks");
    for (let i in this.orderBy) {
      let prop = this.orderBy[i];
      if (this.indicators[prop].order == 'asc') {
        this.stocks.sort((a, b) => {
          return a[prop] - b[prop];
        });
      } else {
        this.stocks.sort((a, b) => {
          return b[prop] - a[prop];
        });
      }
      for(let i in this.stocks) {
        let stock = this.stocks[i];
        stock['pos'+prop] = 1.0+parseInt(i);
        stock['sum'] += parseInt(i);
      }

    }
    this.stocks.sort((a, b) => {
      return a['sum'] - b['sum'];
    });
    for(let i in this.stocks) {
      let stock = this.stocks[i];
      stock['possum'] = 1.0 + parseInt(i);
    }

    console.log("sortStocks end");
  }
  sortByColumn(column){
    if (column.order == 'asc') {
      this.unsortAllColumns();
      column.order = 'desc';
      this.stocks.sort((a, b) => {
        if (b['pos'+column.prop]) {
          return b['pos'+column.prop] - a['pos'+column.prop];
        }
        return b[column.prop] - a[column.prop];
      });
    } else {
      this.unsortAllColumns();
      column.order = 'asc';
      this.stocks.sort((a, b) => {
        if (a['pos'+column.prop]) {
          return a['pos'+column.prop] - b['pos'+column.prop];
        }
        return a[column.prop] - b[column.prop];
      });
    }
  }
  unsortAllColumns() {
    for (let i in this.columns) {
      this.columns[i].order = 'none';
    }
  }
  getColumnClass(column) {
    return this.columnClasses[column.order];
  }
  filterToString(filter) {
    let range = "";
    if (filter['min'] || filter['min'] === 0) {
      let number =  filter['min'] === 0 ? '0' : filter['min'].toString();
      range += '['+ number + ' ';
    } else {
      range += '(∞ '
    }
    if (filter['max'] || filter['max'] === 0) {
      let number = filter['max'] === 0 ? '0' : filter['max'].toString();
      range += '- ' + ((filter['max']==0)? '0': filter['max'].toString()) + ']';
    } else {
      range += '- ∞)';
    }
    return range;
  }
  getTrendClass(trend) {
    if (trend === 'flat') {
      return 'glyphicon glyphicon-circle-arrow-right trend-flat';
    } else if (trend === 'up') {
        return 'glyphicon glyphicon-circle-arrow-up trend-up';
    } else if (trend === 'down') {
        return 'glyphicon glyphicon-circle-arrow-down trend-down';
    }
  }
  isStarStock(stock) {
    return stock['analysis'] && 
           stock['analysis']['short'] === 'up' && 
           stock['analysis']['medium'] === 'up' && 
           stock['analysis']['long'] === 'up';
  }



}