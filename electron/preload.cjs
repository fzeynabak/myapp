const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  addItem: (name) => ipcRenderer.invoke('addItem', name),
  getItems: () => ipcRenderer.invoke('getItems'),
  getDbStats: () => ipcRenderer.invoke('getDbStats'),
  changeDbPath: () => ipcRenderer.invoke('changeDbPath'),
  windowControl: (command) => ipcRenderer.send('window-control', command),
  getConfig: () => ipcRenderer.invoke('getConfig'),
  saveConfig: (data) => ipcRenderer.invoke('saveConfig', data),
  addPerson: (data) => ipcRenderer.invoke('addPerson', data),
  getPersons: () => ipcRenderer.invoke('getPersons'),
  updatePerson: (data) => ipcRenderer.invoke('updatePerson', data),
  deletePerson: (id) => ipcRenderer.invoke('deletePerson', id),
  getShareholders: () => ipcRenderer.invoke('getShareholders'),
  updateShareholder: (data) => ipcRenderer.invoke('updateShareholder', data),
  addShareholderDirect: (data) => ipcRenderer.invoke('addShareholderDirect', data),
  deleteShareholder: (id) => ipcRenderer.invoke('deleteShareholder', id),
  getShareholdersStatistics: () => ipcRenderer.invoke('getShareholdersStatistics'),
  
  // Sellers API
  getSellers: () => ipcRenderer.invoke('getSellers'),
  updateSeller: (data) => ipcRenderer.invoke('updateSeller', data),
  addSellerDirect: (data) => ipcRenderer.invoke('addSellerDirect', data),
  deleteSeller: (id) => ipcRenderer.invoke('deleteSeller', id),

  // Onboarding API
  checkOnboardingStatus: () => ipcRenderer.invoke('checkOnboardingStatus'),
  performOnboarding: (data) => ipcRenderer.invoke('performOnboarding', data),

  // Session API
  loginUser: (credentials) => ipcRenderer.invoke('loginUser', credentials),
  recoverPassword: (data) => ipcRenderer.invoke('recoverPassword', data),
  getUserSecurityQuestion: (username) => ipcRenderer.invoke('getUserSecurityQuestion', username),

  // Users & Access Control API
  getSystemUsers: () => ipcRenderer.invoke('getSystemUsers'),
  saveUserAccount: (data) => ipcRenderer.invoke('saveUserAccount', data),
  deleteUserAccount: (id) => ipcRenderer.invoke('deleteUserAccount', id),

  // Categories & Brands API
  getCategories: () => ipcRenderer.invoke('getCategories'),
  saveCategory: (data) => ipcRenderer.invoke('saveCategory', data),
  deleteCategory: (id) => ipcRenderer.invoke('deleteCategory', id),
  getBrands: () => ipcRenderer.invoke('getBrands'),
  saveBrand: (data) => ipcRenderer.invoke('saveBrand', data),
  deleteBrand: (id) => ipcRenderer.invoke('deleteBrand', id),

  // Employees API
  getEmployees: () => ipcRenderer.invoke('getEmployees'),
  updateEmployee: (data) => ipcRenderer.invoke('updateEmployee', data),
  addEmployeeDirect: (data) => ipcRenderer.invoke('addEmployeeDirect', data),
  deleteEmployee: (id) => ipcRenderer.invoke('deleteEmployee', id),
  getEmployeeTransactions: (employeeId) => ipcRenderer.invoke('getEmployeeTransactions', employeeId),
  addEmployeeTransaction: (data) => ipcRenderer.invoke('addEmployeeTransaction', data),
  deleteEmployeeTransaction: (id) => ipcRenderer.invoke('deleteEmployeeTransaction', id),

  // Warehouses & Products API
  selectLocalImage: () => ipcRenderer.invoke('selectLocalImage'),
  getProducts: () => ipcRenderer.invoke('getProducts'),
  saveProduct: (data) => ipcRenderer.invoke('saveProduct', data),
  deleteProduct: (id) => ipcRenderer.invoke('deleteProduct', id),
  getWarehouses: () => ipcRenderer.invoke('getWarehouses'),
  saveWarehouse: (data) => ipcRenderer.invoke('saveWarehouse', data),
  deleteWarehouse: (id) => ipcRenderer.invoke('deleteWarehouse', id),
  getWarehouseStocks: (warehouseId) => ipcRenderer.invoke('getWarehouseStocks', warehouseId),

  // Price updates & Audit trail API
  applyPriceUpdate: (data) => ipcRenderer.invoke('applyPriceUpdate', data),
  getPriceUpdates: () => ipcRenderer.invoke('getPriceUpdates'),
  getPriceUpdateItems: (updateId) => ipcRenderer.invoke('getPriceUpdateItems', updateId),
  rollbackPriceUpdate: (updateId) => ipcRenderer.invoke('rollbackPriceUpdate', updateId),

  // Invoices & Sales API
  saveInvoice: (data) => ipcRenderer.invoke('saveInvoice', data),
  getInvoices: () => ipcRenderer.invoke('getInvoices'),
  deleteInvoice: (id) => ipcRenderer.invoke('deleteInvoice', id)
});
