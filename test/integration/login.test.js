let server;
const request = require('supertest');
const { User } = require('../../model/userM');

describe('login', () => {
    beforeEach( () => {
        server = require('../../app');
    });

    afterEach( async () => {
        await server.close();
        await User.remove({});
    });

    let emailTest, passwordTest;

    const exec = async () => {
        return await request(server)
            .post('/api/login')
            .send({ email: emailTest, password: passwordTest})
    }

    beforeEach( async () => {
        await request(server)
            .post('/api/register')
            .send({
                firstName: 'tomiwa',
                lastName: 'tomiwa',
                phoneNumber: "09011111111",
                email: 'johnDoe@gmail.com',
                password: '1234567890',
                address: 'we live all around the world'
            });

        emailTest = 'johnDoe@gmail.com';
        passwordTest = '1234567890';
    });

    it ('it should return a 400 if invalid email is passed', async () => {
        emailTest = 'abcdefghijk';

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('it should return a 400 if email is too short', async () => {
        emailTest = 'joh@gmail.com';

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('it should return a 400 if email is too long', async () => {
        const toConcat = new Array(101).join('a')
        emailTest = toConcat + 'joh@gmail.com';

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('it should return a 400 if password is too short', async () => {
        passwordTest = 'joh@gmail.com';

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('it should return a 400 if password is too long', async () => {
        const toConcat = new Array(101).join('a')
        passwordTest = toConcat + '1234345';

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('it should 400 if wrong email is passed', async () => {
        emailTest = 'johnatan@gmail.com'

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('it should 400 if wrong password is passed', async () => {
        passwordTest = 'johnatan@gmail.com'

        const res = await exec();

        expect(res.status).toBe(400)
    });

    it ('a 200 response if email and password are valid', async () => {
        const res = await exec();

        expect(res.status).toBe(200);
        expect(res.body.data).toContain('welcome back')
    });
})