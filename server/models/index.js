var fs = require('fs');
var mysql = require('mysql');
var moment = require('moment'); 

var config = require(`../../config/database.js`);

var connection;

function dbConnect() {
    connection = mysql.createConnection(config);
    connection.connect(function onConnect(err) {
        if (err) {
            console.log('error when connecting to db:', err);
            // setTimeout(handleDisconnect, 10000);
        }
    });
    connection.on('error', function onError(err) {
        console.log('db error', err);
        if (err.code == 'PROTOCOL_CONNECTION_LOST') {
            dbConnect();
        } else {
            throw err;
        }
    });
}
dbConnect();

var db = {
    findAllRows: function (tableName, callback) {
        var sql = "SELECT * FROM ?? ";
        connection.query(sql, [tableName], function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results);
        });
    },

    findAllRowsOrderBy: function (tableName, orderBy, callback) {
        var sql = "SELECT * FROM ?? ";
        sql += orderBy;
        connection.query(sql, [tableName], function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results);
        });
    },

    findOneRowWithId: function (tableName, id, callback) {
        var sql = "SELECT * FROM ?? WHERE id = ?";
        connection.query(sql, [tableName, id], function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results[0]);
        });
    },

    findOneRowWithColumnValue: function (tableName, columnName, value, callback) {
        var sql = "SELECT * FROM ?? WHERE ?? = ?";
        connection.query(sql, [tableName, columnName, value], function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results[0]);
        });
    },

    findOneRowWithColumn1OrColumn2: function (tableName, columnName1, columnName2, value1, value2, callback) {
        var sql = "SELECT * FROM ?? WHERE ?? = ? OR ?? = ?";
        connection.query(sql, [tableName, columnName1, value1, columnName2, value2], function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results[0]);
        });
    },

    findAllWithConstraint: function (tableName, constraint, orderBy = "", callback) {
        var sql = "SELECT * FROM ?? WHERE ";
        var constraintsCount = [];
        var columnsValues = [];
        columnsValues.push(tableName);
        for (var colName in constraint) {
            if (constraint.hasOwnProperty(colName)) {
                constraintsCount.push("?? = ?");
                columnsValues.push(colName);
                columnsValues.push(constraint[colName]);
            }
        }
        constraintsCount = constraintsCount.join(' AND ');
        sql += constraintsCount;
        if (orderBy !== "") {
            sql += " " + orderBy + " ";
        }
        connection.query(sql, columnsValues, function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results);
        });
    },

    findOneWithConstraint: function (tableName, constraint, orderBy = "", callback) {
        var sql = "SELECT * FROM ?? WHERE ";
        var constraintsCount = [];
        var columnsValues = [];
        columnsValues.push(tableName);
        for (var colName in constraint) {
            if (constraint.hasOwnProperty(colName)) {
                constraintsCount.push("?? = ?");
                columnsValues.push(colName);
                columnsValues.push(constraint[colName]);
            }
        }
        constraintsCount = constraintsCount.join(' AND ');
        sql += constraintsCount;
        if (orderBy !== "") {
            sql += " " + orderBy + " ";
        }
        sql += " LIMIT 1 ";
        connection.query(sql, columnsValues, function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results[0]);
        });
    },

    insert: function (tableName, insertObj, callback) {
        var sql = "INSERT INTO ?? (";
        var insertCount = 0;
        var columnNames = [];
        var columnValues = [];
        // tableName is the first string in the insertArr, so give it to columnNames
        // since columnNames will be placed first in the insertArr
        columnNames.push(tableName);
        // add json object key and values to columnNames and columnValues
        // and count the number of inserts
        for (var colName in insertObj) {
            if (insertObj.hasOwnProperty(colName)) {
                insertCount += 1;
                columnNames.push(colName);
                columnValues.push(insertObj[colName]);
            }
        }
        // block the user if they give an empty object or no object
        if (insertCount === 0) {
            var error = "Error: No json to insert."
            callback(error)
            return;
        }
        // add createdAt and updatedAt
        columnNames.push(`createdAt`);
        columnNames.push(`updatedAt`);
        columnValues.push(moment().format('YYYY-MM-DD HH:mm:ss'));
        columnValues.push(moment().format('YYYY-MM-DD HH:mm:ss'));
        // add to insertcount for createdAt and updatedAt
        insertCount += 2;
        // combine ColumnNames and columnValues into insertArr
        var insertArr = columnNames.concat(columnValues);
        // Create the ??s based upon how many inserts we're making
        sql += ("??, ".repeat(insertCount - 1));
        sql += ("??) VALUES (");
        sql += ("?, ".repeat(insertCount - 1));
        sql += ("?)");
        connection.query(sql, insertArr, function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results);
        });
    },

    update: function (tableName, updateObj, constraintObj, callback) {
        var sql = "UPDATE ?? SET ";
        var updateCount = 0;
        var constraintCount = 0;
        var data = [];
        // tableName is the first string in the data
        data.push(tableName);
        // add json update object key and values to data
        // and count the number of updates
        for (var colName in updateObj) {
            if (updateObj.hasOwnProperty(colName)) {
                updateCount += 1;
                data.push(colName);
                data.push(updateObj[colName]);
            }
        }
        // add updatedAt
        data.push(`updatedAt`);
        data.push(moment().format('YYYY-MM-DD HH:mm:ss'));
        // add json contraint object key and values to data
        // and count the number of constraints
        for (var colName in constraintObj) {
            if (constraintObj.hasOwnProperty(colName)) {
                constraintCount += 1;
                data.push(colName);
                data.push(constraintObj[colName]);
            }
        }
        // block the user if they give an empty object or no object
        if (updateCount === 0) {
            var error = "Error: No json to update."
            callback(error)
            return;
        }
        if (constraintCount === 0) {
            var error = "Error: No constraint json."
            callback(error)
            return;
        }
        // add to updateCount for updatedAt
        updateCount += 1;
        // Create the ??s based upon number of updates and constraints 
        sql += ("?? = ?, ".repeat(updateCount - 1));
        sql += ("?? = ? WHERE ");
        sql += ("?? = ? AND ".repeat(constraintCount - 1));
        sql += ("?? = ?");
        connection.query(sql, data, function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results);
        });
    },

    deleteAllRows: function (tableName, callback) {
        var sql = "DELETE FROM ?? ";
        connection.query(sql, [tableName], function (error, results) {
            if (error) {
                callback(error);
                return;
            }
            callback(null, results);
        });
    },
    customizedQuery: function(query, parameters, callback) {
        var sql = query;
        connection.query(sql, parameters, function(error, results){
            if(error) {
                callback(error);
                return;
            }
            callback(null, results); 
        });
    },
    CURRENT_TIMESTAMP: function(){
        return moment().format('YYYY-MM-DD HH:mm:ss');
    }
}


module.exports = db;
