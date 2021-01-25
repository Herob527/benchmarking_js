import pymongo

"""
config = {
    "host":"mongodb://<host>:<port>/", 
    "database":"<database>",
    "collection":"<collection>"
}
"""


class mongo_connect_coll:
    def __init__(self, config: dict) -> None:
        self.configuration = config

    def __enter__(self) -> 'collection':
        self.client = pymongo.MongoClient(self.configuration['host'])
        self.database = self.client[self.configuration['database']]
        self.collection = self.database[self.configuration['collection']]
        return self.collection

    def __exit__(self, exc_type, exc_value, exc_trace) -> None:
        self.client.close()

class mongo_connect:
    def __init__(self, config: dict) -> None:
        self.configuration = config

    def __enter__(self) -> 'database':
        self.client = pymongo.MongoClient(self.configuration['host'])
        self.database = self.client[self.configuration['database']]
        return self.database

    def __exit__(self, exc_type, exc_value, exc_trace) -> None:
        self.client.close()