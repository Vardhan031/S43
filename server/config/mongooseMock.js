const store = {
  Tournament: [],
  Participant: [],
  Group: [],
  Match: []
};

function generateId() {
  return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
}

class Document {
  constructor(modelName, data) {
    this._modelName = modelName;
    Object.assign(this, data);
    if (!this._id) {
      this._id = generateId();
    }
    if (!this.createdAt) {
      this.createdAt = new Date().toISOString();
    }
    this.updatedAt = new Date().toISOString();
  }

  toString() {
    return String(this._id);
  }

  async save() {
    const list = store[this._modelName];
    const index = list.findIndex(d => String(d._id) === String(this._id));
    
    // Normalize references back to string IDs on save to match Mongoose state
    const savedData = { ...this };
    delete savedData._modelName;

    // Convert populated objects back to IDs in savedData to mimic DB state
    const refFields = ['participant1', 'participant2', 'winner', 'groupId', 'tournamentId'];
    refFields.forEach(field => {
      if (savedData[field] && typeof savedData[field] === 'object' && savedData[field]._id) {
        savedData[field] = String(savedData[field]._id);
      }
    });

    if (savedData.participants && Array.isArray(savedData.participants)) {
      savedData.participants = savedData.participants.map(p => 
        (p && typeof p === 'object' && p._id) ? String(p._id) : String(p)
      );
    }

    const docToStore = new Document(this._modelName, savedData);

    if (index >= 0) {
      list[index] = docToStore;
    } else {
      list.push(docToStore);
    }
    
    // Maintain local populated references on the returned instance
    return this;
  }

  async deleteOne() {
    const list = store[this._modelName];
    const index = list.findIndex(d => String(d._id) === String(this._id));
    if (index >= 0) {
      list.splice(index, 1);
    }
    return { deletedCount: 1 };
  }

  async populate(path) {
    populateDoc(this, path);
    return this;
  }
}

// Helpers for populating documents
function populateDoc(doc, path) {
  if (!doc) return;
  
  if (path === "participants" && Array.isArray(doc.participants)) {
    doc.participants = doc.participants.map(id => {
      if (id && typeof id === 'object') return id;
      const found = store.Participant.find(p => String(p._id) === String(id));
      return found ? new Document("Participant", found) : id;
    });
  }

  const refMap = {
    participant1: "Participant",
    participant2: "Participant",
    winner: "Participant",
    groupId: "Group",
    tournamentId: "Tournament"
  };

  const targetModel = refMap[path];
  if (targetModel && doc[path]) {
    if (typeof doc[path] === 'object') return;
    const found = store[targetModel].find(item => String(item._id) === String(doc[path]));
    if (found) {
      doc[path] = new Document(targetModel, found);
    }
  }
}

class QueryChain {
  constructor(modelName, results) {
    this.modelName = modelName;
    this.results = results.map(r => r instanceof Document ? r : new Document(modelName, r));
    this.populates = [];
    this.sortCriteria = null;
  }

  populate(path) {
    this.populates.push(path);
    return this;
  }

  sort(criteria) {
    this.sortCriteria = criteria;
    return this;
  }

  exec() {
    let output = [...this.results];

    // Apply sorting
    if (this.sortCriteria) {
      const keys = Object.keys(this.sortCriteria);
      output.sort((a, b) => {
        for (const key of keys) {
          const dir = this.sortCriteria[key];
          const valA = a[key];
          const valB = b[key];
          if (valA < valB) return dir === -1 || dir === 'desc' || dir === 'descending' ? 1 : -1;
          if (valA > valB) return dir === -1 || dir === 'desc' || dir === 'descending' ? -1 : 1;
        }
        return 0;
      });
    }

    // Apply population
    output.forEach(doc => {
      this.populates.forEach(path => {
        populateDoc(doc, path);
      });
    });

    return Promise.resolve(output);
  }

  then(onSuccess, onError) {
    return this.exec().then(onSuccess, onError);
  }
}

class MockModel {
  constructor(modelName) {
    this.modelName = modelName;
  }

  find(query = {}) {
    let list = store[this.modelName] || [];
    
    if (query && Object.keys(query).length > 0) {
      list = list.filter(item => {
        return Object.keys(query).every(key => {
          const val = query[key];
          if (val && typeof val === 'object') {
            if ('$ne' in val) {
              return String(item[key]) !== String(val['$ne']);
            }
          }
          return String(item[key]) === String(val);
        });
      });
    }
    return new QueryChain(this.modelName, list);
  }

  findOne(query = {}) {
    let list = store[this.modelName] || [];
    if (query && Object.keys(query).length > 0) {
      list = list.filter(item => {
        return Object.keys(query).every(key => {
          return String(item[key]) === String(query[key]);
        });
      });
    }
    const found = list[0] || null;
    return new QueryChain(this.modelName, found ? [found] : []).then(results => results[0] || null);
  }

  async findById(id) {
    const list = store[this.modelName] || [];
    const found = list.find(item => String(item._id) === String(id));
    if (!found) return null;
    return new Document(this.modelName, found);
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const doc = await this.findById(id);
    if (!doc) return null;
    
    const updates = update.$set || update;
    Object.assign(doc, updates);
    await doc.save();
    return doc;
  }

  async findByIdAndDelete(id) {
    const doc = await this.findById(id);
    if (!doc) return null;
    await doc.deleteOne();
    return doc;
  }

  async create(data) {
    if (Array.isArray(data)) {
      const docs = data.map(item => new Document(this.modelName, item));
      for (const doc of docs) {
        await doc.save();
      }
      return docs;
    } else {
      const doc = new Document(this.modelName, data);
      await doc.save();
      return doc;
    }
  }

  async insertMany(docs, options = {}) {
    const created = [];
    for (const item of docs) {
      const doc = new Document(this.modelName, item);
      await doc.save();
      created.push(doc);
    }
    return created;
  }

  async countDocuments(query = {}) {
    const chain = this.find(query);
    const results = await chain.exec();
    return results.length;
  }

  async deleteMany(query = {}) {
    let list = store[this.modelName] || [];
    const remaining = [];
    let deletedCount = 0;
    
    list.forEach(item => {
      const matches = Object.keys(query).every(key => {
        return String(item[key]) === String(query[key]);
      });
      if (matches) {
        deletedCount++;
      } else {
        remaining.push(item);
      }
    });

    store[this.modelName] = remaining;
    return { deletedCount };
  }
}

class Schema {
  constructor(definition, options) {
    this.definition = definition;
    this.options = options;
  }

  index() {}
}

Schema.Types = {
  ObjectId: 'ObjectId'
};

const MockObjectId = function(id) {
  if (id) return String(id);
  return generateId();
};
MockObjectId.isValid = (id) => typeof id === 'string' && id.length === 24;

const Types = {
  ObjectId: MockObjectId
};

const connect = async () => {
  console.log("Mock Database Connected: In-Memory Mode");
  return { connection: { host: "memory-store" } };
};

const models = {};

const model = (name, schema) => {
  if (!models[name]) {
    models[name] = new MockModel(name);
  }
  return models[name];
};

module.exports = {
  Schema,
  connect,
  model,
  models,
  Types,
  store // Export raw store for seeding or debugging if needed
};
