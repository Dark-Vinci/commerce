let server;
const request = require('supertest');

const { User } = require('../../model/userM');

describe('register user', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach( async () => {
        await server.close();
        await User.remove({})
    });  

    let firstName, lastName,
        email, password,
        address, phoneNumber;

    const exec = async () => {
        return await request(server)
            .post('/api/register')
            .send({
                firstName, lastName, 
                email, password, 
                address, phoneNumber
            });
    }

    beforeEach(() => {
        firstName = 'tomiwa';
        lastName = 'tomiwa';
        phoneNumber = "09011111111";
        email = 'johnDoe@gmail.com';
        password = '1234567890';
        address = 'we live all around the world';
    });

    it ('should return 400 if firstName is too short', async () => {
        firstName = 'a';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if lastName is too short', async () => {
        lastName = 'a';

        const res = await exec();

        expect(res.status).toBe(400);  
    });

    it ('should return 400 if firstName is too long', async () => {
        firstName = new Array(50).join('a')

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if lastname is too long', async () => {
        lastName = new Array(50).join('ab')

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if phoneNumber is too short', async () => {
        phoneNumber = '090'

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if phoneNumber is too long', async () => {
        phoneNumber = new Array(50).join('ab')

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if invalid email is passed', async () => {
        email = 'abcdefgh'

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if password is too short', async () => {
        password = '090'

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if password is too long', async () => {
        password = new Array(110).join('ab')

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if address is too short', async () => {
        address = '090'

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it ('should return 400 if address is too long', async () => {
        address = new Array(210).join('ab')

        const res = await exec();
 
        expect(res.status).toBe(400);
    });

    
    it ('should return 200 with token when inputs are valid', async () => {
        const res = await exec();
  
        expect(res.status).toBe(200);
    });
});