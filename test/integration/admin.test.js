let server;
const request = require('supertest');
const { Admin } = require('../../model/admin');

describe('/admin', () => {
    beforeEach(() => {
        server = require('../../app');
    });

    afterEach( async () => {
        await server.close();
        await Admin.remove({});
    });

    describe('/register', () => {
        let name,
            email, 
            password,
            phoneNumber;

        const exec = async () => {
            return await request(server)
            .post('/api/admin/register')
            .send({
                name,
                email, 
                password,
                phoneNumber
            });
        } 

        beforeEach(() => {
            name = 'tomiwa';
            email = 'johnDoe@gmail.com';
            phoneNumber = '09011111111';
            password = '1234567890'
        });

        it ('should return a 400 status if short name is passed', async () => {
            name = 'a';

            const res = await exec();

            expect(res.status).toBe(400); 
        });
        
        it ('should return a 400 status if long name is passed', async () => {
            name = new Array(52).join('a')

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if invalid email is passed', async () => {
            email = 'johnDoe'

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if phoneNumber is too short', async () => {
            phoneNumber = '090'

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if phoneNumber is too long', async () => {
            phoneNumber = '0901111111111111'

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if password is too short', async () => {
            password = '090'

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if password is too long', async () => {
            password = new Array(110).join('a');

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if there are 3 admins already', async () => {
            await Admin.collection.insertMany([ 
                { name: 'tomiwar', email: 'johnDoe1@gmail.com', phoneNumber: '09011111112', password: '1234567890' },
                { name: 'tomiwar1', email: 'johnDoe2@gmail.com', phoneNumber: '09011111113', password: '1234567890' },
                { name: 'tomiwar2', email: 'johnDoe3@gmail.com', phoneNumber: '09011111114', password: '1234567890' }
            ])
            const res = await exec();

            expect(res.status).toBe(400); 
            expect(res.body.message).toContain('we cant have more than 3 admin in the db...')
        });

        it ('should return a 400 status if theres an admin with same email', async () => {
            await Admin.collection.insertMany([ 
                { name: 'tomiwar1', email: 'johnDoe2@gmail.com', phoneNumber: '09011111113', password: '1234567890' },
                { name: 'tomiwar2', email: 'johnDoe3@gmail.com', phoneNumber: '09011111114', password: '1234567890' }
            ]);

            email = 'johnDoe2@gmail.com';
            const res = await exec();

            expect(res.status).toBe(400); 
            expect(res.body.message).toContain('we have a user with same email or password')
        });

        it ('should return a 400 status if theres an admin with same phoneNumber', async () => {
            await Admin.collection.insertMany([ 
                { name: 'tomiwar1', email: 'johnDoe2@gmail.com', phoneNumber: '09011111113', password: '1234567890' },
                { name: 'tomiwar2', email: 'johnDoe3@gmail.com', phoneNumber: '09011111114', password: '1234567890' }
            ]);

            phoneNumber = '09011111114';
            const res = await exec();

            expect(res.status).toBe(400); 
            expect(res.body.message).toContain('we have a user with same email or password')
        });

        it ('should set the admin as a superadmin if theres no admin in the db', async () => {
            const res = await exec();

            expect(res.status).toBe(201); 
            expect(res.body.data.superAdmin).toBeTruthy();
        });

        it ('should set the admin as a superadmin if theres no admin in the db', async () => {
            await Admin.collection.insertMany([ 
                { name: 'tomiwar1', email: 'johnDoe2@gmail.com', phoneNumber: '09011111113', password: '1234567890' },
                { name: 'tomiwar2', email: 'johnDoe3@gmail.com', phoneNumber: '09011111114', password: '1234567890' }
            ]);

            const res = await exec();

            expect(res.status).toBe(201); 
            expect(res.body.data.superAdmin).not.toBeTruthy();
        });  
    });

    describe('/login', () => {
        let email,
            password;

        const exec = async () => {
            return await request(server)
                .post('/api/admin/login')
                .send({ email, password });
        }

        beforeEach( async () => {
            password = '1234567890';
            email = 'johnDoe@gmail.com';
            let name = 'the name';
            let phoneNumber = '090111111111';

            await request(server)
                .post('/api/admin/register')
                .send({ email, password, phoneNumber, name });
        });

        it ('should return a 400 status if invalid email is passed', async () => {
            email = 'johnDoe'

            const res = await exec();

            expect(res.status).toBe(400); 
        });

        it ('should return a 400 status if wrong email is passed', async () => {
            email = 'johnDoe1@gmail.com'

            const res = await exec();

            expect(res.status).toBe(400); 
            expect(res.body.message).toContain('invalid email or password');
        });

        it ('should return a 400 status if wrong password is passed', async () => {
            password = '123456789';

            const res = await exec();

            expect(res.status).toBe(400); 
            expect(res.body.message).toContain('invalid email or password');
        });

        it ('should return a 200 if valid email and password is passed', async () => {
            const res = await exec();

            expect(res.status).toBe(200); 
            expect(res.body.data).toContain('welcome back admin...');
        });
    });
});