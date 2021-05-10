const autocannon = require('autocannon');
const token = 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiQW5vbnltb3VzIiwiaWF0IjoxNjIwNjM0ODE2LCJleHAiOjE2MjA3MjEyMTYsImF1ZCI6Imh0dHA6Ly9sb2NhbGhvc3QiLCJpc3MiOiJHdWlkb0NvZGUgY29ycCIsInN1YiI6Ikd1aWRvQ29kZUBnbWFpbC5jb20ifQ.TE5d29n9yBJdHiLRhRTsW9gtPX3C5tVBVrNxtzMq8Oc2V2PQviyphHoS-ZwRF_3LMlhPKyTBXstJN5rud8GGtvQctaMMddPyrPvWfEhsOoSWwSU8dISl1xUc_d6lbQNiVFur2SXoYLBB7h33vyBBOHWXbJJd9l3RSoJv8Ud3l9sv4aQ0q4Ma5-jXyD2JvEb-G2HGtIH-ylKyaX-j_q1BcaUQ5t8oA_KuOZTJgBik_STAok01t5v6qU6ok6um3iVSqJbgGRz9tS6iSlAGbQSt_pIID6SyVaA2es6H7zV1xoRAnpsYtw2-S--RAzT20w8UyKSyAFCOCPahBRyuaeyI_g';

async function simpleGatewayGet() {
    console.log('Simple get benchmark');
    const result = await autocannon({
        url: 'http://localhost:8080/converter/1',
        headers: {
            'Authorization': token
        },
        connections: 10, //default
        pipelining: 1, // default
        duration: 10 // default
    });
    console.log(autocannon.printResult(result));
}

async function midiFileToNotes() {
    console.log('Midi file to notes benchmark');
    const result = await autocannon({
        url: 'http://localhost:8081/midi/notes/circle.mid',
        connections: 10, //default
        pipelining: 1, // default
        duration: 10 // default
    });
    console.log(autocannon.printResult(result));
}

async function midiFileToNotesViaGateway() {
    console.log('Midi file to notes via gateway benchmark');
    const result = await autocannon({
        url: 'http://localhost:8080/converter/notes',
        method: 'POST',
        headers: {
            'Authorization': token,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        },
        form: {
            file: {
                type: "file",
                path: "D:\\BSU\\course_4\\notes_recognition\\Circle.mid"
            }
        },
        connections: 10, //default
        pipelining: 1, // default
        duration: 10 // default
    });
    console.log(autocannon.printResult(result));
}

async function main() {
    console.log('Start benchmarking');
    //await simpleGatewayGet();
    //await midiFileToNotes();
    await midiFileToNotesViaGateway();
    console.log('End benchmarking');
}

main();

