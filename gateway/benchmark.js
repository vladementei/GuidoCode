const autocannon = require('autocannon');

async function simpleGatewayGet() {
    console.log('Simple get benchmark');
    const result = await autocannon({
        url: 'http://localhost:8080/converter/1',
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
        headers: {headers: {'Content-Type': 'multipart/form-data'}},
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
    await simpleGatewayGet();
    //await midiFileToNotes();
    //await midiFileToNotesViaGateway();
    console.log('End benchmarking');
}

main();

