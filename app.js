const express = require("express");
const app = express();
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
app.use(express.json());
const dbPath = path.join(__dirname, "covid19India.db");
let db = null;

const runningServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(4000, () => {
      console.log("server started http://locolhost/3000");
    });
  } catch (e) {
    console.log(`error${e.message}`);
    process.exit(1);
  }
};

runningServer();

//API GET
app.get("/states/", async (request, response) => {
  const getQuery = `select * from state order by state_id;`;
  const result = await db.all(getQuery);
  response.send(result);
});

//API GET ONE STATE
app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `select * from state where state_id = ${stateId};`;
  const result = await db.get(getQuery);
  response.send(result);
});

//API POST DISTRICTS
app.post("/districts/", async (request, response) => {
  const addBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = addBody;
  const getQuery = `insert into district (district_name,state_id,cases,cured,active,deaths)
    values(
        '${districtName}',
        ${stateId},
        ${cases},
        ${cured},
        ${active},
        ${deaths}
    );`;
  const result = await db.run(getQuery);
  response.send("District Successfully Added");
});

//API GET DISTRICT
app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `select * from district where district_id = ${districtId};`;
  const result = await db.get(getQuery);
  response.send(result);
});

//API DELETE DISTRICT
app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `delete from district where district_id = ${districtId};`;
  await db.run(getQuery);
  response.send("District Removed");
});

//API UPDATE DISTRICT
app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const districtBody = request.body;
  const { districtName, stateId, cases, cured, active, deaths } = districtBody;
  const getQuery = `update district 
    set
    district_name = '${districtName}',
    state_id = ${stateId},
    cases = ${cases},
    cured = ${cured},
    active = ${active},
    deaths = ${deaths}
    where district_id = ${districtId};`;
  await db.run(getQuery);
  response.send("District Details Updated");
});

//API TOTAL CASES
app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;
  const getQuery = `select sum(cases) as totalCases,
    sum(cured) as totalCured, 
    sum(active) as totalActive, 
    sum(deaths) as totalDeaths
    from district
    where state_id = ${stateId};`;
  const result = await db.get(getQuery);
  response.send(result);
});

//API GET DISTRICT WITH STATE
app.get("/districts/:districtId/details/", async (request, response) => {
  const { districtId } = request.params;
  const getQuery = `SELECT (state_name) as stateName FROM STATE JOIN DISTRICT ON state.state_id = district.state_id where district.district_id = ${districtId};`;
  const result = await db.get(getQuery);
  response.send(result);
});

module.exports = app;
