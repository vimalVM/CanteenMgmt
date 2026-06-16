// cleanup.js
print("Starting cleanup...");
var dbName = "canteendb";
db = db.getSiblingDB(dbName);

var duplicates = db.carts.aggregate([
    { $group: { _id: "$userId", count: { $sum: 1 }, docs: { $push: "$_id" } } },
    { $match: { count: { $gt: 1 } } }
]).toArray();

print("Found " + duplicates.length + " users with duplicate carts.");

duplicates.forEach(function(doc) {
    print("User " + doc._id + " has " + doc.count + " carts.");
    // keep the first one
    doc.docs.shift(); 
    // delete the rest
    var res = db.carts.deleteMany({ _id: { $in: doc.docs } });
    print("Deleted " + res.deletedCount + " duplicate carts for user " + doc._id);
});

print("Cleanup complete.");
