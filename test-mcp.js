import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Start the server process
const server = spawn('node', [
  'build/index.js',
  '--debug',
  '--sftp-host', '10.200.72.31',
  '--sftp-port', '2022',
  '--sftp-user', 'cursor',
  '--sftp-pass', 'cursor',
  '--sftp-base', '/memory-bank'
]);

// Function to send a JSON-RPC request and wait for response
async function sendRequest(request) {
  return new Promise((resolve, reject) => {
    let responseData = '';

    const responseHandler = (data) => {
      responseData += data.toString();
      try {
        const response = JSON.parse(responseData);
        if (response.id === request.id) {
          cleanup();
          resolve(response);
        }
      } catch (e) {
        // Not a complete JSON yet, keep waiting
      }
    };

    const errorHandler = (data) => {
      console.error(`stderr: ${data}`);
    };

    const cleanup = () => {
      server.stdout.removeListener('data', responseHandler);
      server.stderr.removeListener('data', errorHandler);
    };

    server.stdout.on('data', responseHandler);
    server.stderr.on('data', errorHandler);

    // Send the request
    server.stdin.write(JSON.stringify(request) + '\n');
  });
}

// Main function to run tests
async function runTests() {
  try {
    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Test set_memory_bank_path
    console.log('\nTesting set_memory_bank_path...');
    const setPathResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: {
        name: 'set_memory_bank_path',
        arguments: {
          path: '/'
        }
      }
    });
    console.log('Set path response:', JSON.stringify(setPathResponse, null, 2));

    // Test initialize_memory_bank
    console.log('\nTesting initialize_memory_bank...');
    const initResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 2,
      method: 'tools/call',
      params: {
        name: 'initialize_memory_bank',
        arguments: {
          path: '/'
        }
      }
    });
    console.log('Initialize response:', JSON.stringify(initResponse, null, 2));

    // Test read_memory_bank_file
    console.log('\nTesting read_memory_bank_file...');
    const readResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 3,
      method: 'tools/call',
      params: {
        name: 'read_memory_bank_file',
        arguments: {
          filename: 'product-context.md'
        }
      }
    });
    console.log('Read response:', JSON.stringify(readResponse, null, 2));

    // Test get_memory_bank_status
    console.log('\nTesting get_memory_bank_status...');
    const statusResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 4,
      method: 'tools/call',
      params: {
        name: 'get_memory_bank_status',
        arguments: {
          random_string: 'dummy'
        }
      }
    });
    console.log('Status response:', JSON.stringify(statusResponse, null, 2));

    // Test SFTP file operations
    console.log('\nTesting SFTP file operations...');
    const sftpWriteResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 5,
      method: 'tools/call',
      params: {
        name: 'write_memory_bank_file',
        arguments: {
          filename: 'test-sftp.md',
          content: '# SFTP Test\n\nThis is a test file written via SFTP.'
        }
      }
    });
    console.log('SFTP write response:', JSON.stringify(sftpWriteResponse, null, 2));

    const sftpReadResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 6,
      method: 'tools/call',
      params: {
        name: 'read_memory_bank_file',
        arguments: {
          filename: 'test-sftp.md'
        }
      }
    });
    console.log('SFTP read response:', JSON.stringify(sftpReadResponse, null, 2));

    const sftpListResponse = await sendRequest({
      jsonrpc: '2.0',
      id: 7,
      method: 'tools/call',
      params: {
        name: 'list_memory_bank_files',
        arguments: {
          random_string: 'dummy'
        }
      }
    });
    console.log('SFTP list response:', JSON.stringify(sftpListResponse, null, 2));

    // Clean up
    server.kill();
  } catch (error) {
    console.error('Test error:', error);
    server.kill();
  }
}

// Run the tests
runTests().catch(console.error); 