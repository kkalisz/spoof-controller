import {spawn} from 'child_process';
import {CommandResult} from './command_result';

const debugCommands = true;
export function runCommand(command: string): Promise<CommandResult> {
  return new Promise((resolve) => {
    if(debugCommands){
      console.log(`run command: ${command}`)
    }
    const childProcess = spawn(command, { shell: true });
    let result: string = '';
    let error: string = '';

    childProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    childProcess.stderr.on('data', (data) => {
      error += data.toString();
    });

    childProcess.on('close', (code) => {
      const resultObject: CommandResult = {};
      if (code === 0) {
        if (result) {
          resultObject.result = result;
        }
      } else {
        if (error) {
          resultObject.error = error;
        }
      }
      if(debugCommands){
        console.log(`run command ${command} result: ${JSON.stringify(resultObject)}`)
      }
      resolve(resultObject);
    });
  });
}