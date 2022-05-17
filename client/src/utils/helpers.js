export function pluralize(name, count) {
  if (count === 1) {
    return name;
  }
  return name + "s";
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to the db `shop-shop` w/ v1
    const request = window.indexedDB.open("shop-shop", 1);

    // create variables to hold reference to the db, transaction (txn), and object store
    let db, txn, store;

    // if version chnages (or first time using db), run this method and create 3 objStores
    request.onupgradeneeded = function (e) {
      const db = request.result;
      // create object store for each type of data and set "primary" key index to be the `_id` of the data
      db.createObjectStore("products", { keyPath: "_id" });
      db.createObjectStore("categories", { keyPath: "_id" });
      db.createObjectStore("cart", { keyPath: "_id" });
    };

    // handle any errors with connecting
    request.onerror = function (e) {
      console.log("There was an error");
    };

    // on db open success
    request.onsuccess = function(e) {
      // save a reference of the database to the `db` variable
      db = request.result;
      // open a txn to do whatever we pass into `storeName` (must match one of the object store names)
      txn = db.transaction(storeName, 'readwrite');
      // save a ref to the object store
      store = txn.objectStore(storeName);

      // if there's any errors, let us know
      db.onerror = function(e) {
        console.log('error', e)
      };

      // CHECK METHOD VALUE AND PERFORM FUNC
      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = function () {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      }

      // when the txn is complete, close the connection
      txn.oncomplete = function() {
        db.close();
      }
    }
  });
}
