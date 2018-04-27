const NgsiV2 = require('ngsi_v2');
const defaultClient = NgsiV2.ApiClient.instance;
defaultClient.basePath = process.env.CONTEXT_BROKER || 'http://localhost:1026/v2';

function displayStore(req, res) {
	const store = res.locals.data.store;
	const products = res.locals.data.products;
	const inventory = res.locals.data.inventory;

	res.render('store', { title: store.name, store, products, inventory });
}

function displayTillInfo(req, res) {
	const store = res.locals.data.store;
	const products = res.locals.data.products;
	const inventory = res.locals.data.inventory;

	res.render('till', { title: store.name, store, products, inventory });
}

function displayWarehouseInfo(req, res) {
	res.render('warehouse', { id: req.params.storeId });
}

async function readContextData(req, res, next) {
	const store = await retrieveEntity(req.params.storeId, { options: 'keyValues', type: 'Store' });
	const products = await listEntities({
		options: 'keyValues',
		type: 'Product',
	});
	const inventory = await listEntities({
		q: 'refStore==' + req.params.storeId,
		options: 'keyValues',
		type: 'InventoryItem',
	});

	res.locals.data = { store, products, inventory };
	next();
}

async function buyItem(req, res) {
	const inventory = await retrieveEntity(req.params.inventoryId, {
		options: 'keyValues',
		type: 'InventoryItem',
	});
	const count = inventory.shelfCount - 1;
	await updateExistingEntityAttributes(
		req.params.inventoryId,
		{ shelfCount: { type: 'Integer', value: count } },
		{
			type: 'InventoryItem',
		}
	);
	res.redirect(`/app/store/${inventory.refStore}/till`);
}

function updateExistingEntityAttributes(entityId, body, opts) {
	return new Promise(function(resolve, reject) {
		const apiInstance = new NgsiV2.EntitiesApi();
		apiInstance.updateExistingEntityAttributes(entityId, body, opts, (error, data) => {
			return error ? reject(error) : resolve(data);
		});
	});
}

function retrieveEntity(entityId, opts) {
	return new Promise(function(resolve, reject) {
		const apiInstance = new NgsiV2.EntitiesApi();
		apiInstance.retrieveEntity(entityId, opts, (error, data) => {
			return error ? reject(error) : resolve(data);
		});
	});
}

function listEntities(opts) {
	return new Promise(function(resolve, reject) {
		const apiInstance = new NgsiV2.EntitiesApi();
		apiInstance.listEntities(opts, (error, data) => {
			return error ? reject(error) : resolve(data);
		});
	});
}

module.exports = {
	buyItem,
	readContextData,
	displayStore,
	displayTillInfo,
	displayWarehouseInfo,
};
