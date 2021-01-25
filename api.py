from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_restful import Api, Resource, reqparse

from pprint import pprint
from mongo_db_context_maganer import mongo_connect_coll, mongo_connect

import pymongo
import json

import time

app = Flask(__name__)
app.debug = True
app.config['mongo_config'] = {
    "host": "mongodb://localhost:27017",
    "database": "benchmark_results",
}
CORS(app)
api = Api(app)


class GetCollNames(Resource):
    def __init__(self):
        pass
    def post(self):
        pass
    def get(self):
        with mongo_connect(app.config['mongo_config']) as collection:
            return collection.list_collection_names()


class BenchmarkResults(Resource):
    def __init__(self):
        self.reqparse = reqparse.RequestParser()
        self.reqparse.add_argument('collection',type=str,default='')
        args = self.reqparse.parse_args()
        self.config = {'mongo_config': app.config['mongo_config']}
        self.config['mongo_config']['collection'] = args['collection']
    def get(self):
        # Get data from collection stated in url query parameter
        coll = self.config['mongo_config']['collection']
        mongo_query = "db.{0}.find()".format(coll)
        try:
            with mongo_connect_coll(self.config['mongo_config']) as collection:
                res = collection.find({},{"_id":0,"array_size":1, "results":1})
                di = {}
                for i in enumerate(res):
                    di[i[0]] = i[1]
                    print(di[i[0]])
                print(di)
                return di
        except Exception as e:
            print(e)
    def post(self):
        data = request.get_json()
        print(data)
        try:
            with mongo_connect_coll(self.config['mongo_config']) as collection:
                collection.insert_one(data)
        except pymongo.errors.DuplicateKeyError:
            pass
        except Exception:
            return Exception


api.add_resource(BenchmarkResults,
                 '/api/benchmark_results')
api.add_resource(GetCollNames,'/api/collections_names')
if __name__ == "__main__":
    app.run(host="127.0.0.1", port='5001', )
