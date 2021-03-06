process.env.NODE_ENV = "test";

require("./support/db");

require("./model_generator");
require("./transforms");
require("./validators");
require("./model/db");
require("./model/configuration");
require("./model/delete");
require("./model/delete_many");
require("./model/first");
require("./model/get");
require("./model/get_many");
require("./model/insert");
require("./model/insert_many");
require("./model/select");
require("./model/update");
