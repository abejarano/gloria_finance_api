# AGENTS Documentation

## Introduction
This project uses vanilla Express.js and MongoDB with our custom criteria library, **@abejarano/ts-mongodb-criteria** (v1.2.0). This setup focuses on manual dependency injection following the singleton pattern, avoiding the use of decorators and frameworks.

## Key Components

### Vanilla Express.js
- Our application is built using Express.js without any NestJS structure. This allows for a simpler and more direct approach to developing APIs.

### MongoDB with @abejarano/ts-mongodb-criteria
- We utilize the @abejarano/ts-mongodb-criteria library (v1.2.0) for efficient database queries. This library allows you to create flexible criteria for your MongoDB queries in TypeScript.

### Manual Dependency Injection
- The service layer is implemented using the singleton pattern to manage dependencies manually. This approach promotes a clean and easily testable architecture.

### No Decorators
- We avoid using decorators to keep the codebase clean and straightforward. All configurations are handled through plain TypeScript classes.

## Examples

### Repository Implementation
Here is a simple example of a repository implementation:
```typescript
import { MongoClient } from 'mongodb';

class UserRepository {
  private static instance: UserRepository; 
  private client: MongoClient;

  private constructor() {
    this.client = new MongoClient('mongodb://localhost:27017');
  }

  public static getInstance(): UserRepository {
    if (!UserRepository.instance) {
      UserRepository.instance = new UserRepository();
    }
    return UserRepository.instance;
  }

  public async findUserById(id: string) {
    const db = this.client.db('mydb');
    return await db.collection('users').findOne({ id });
  }
}
```

### Using Criteria
Using the criteria library is straightforward:
```typescript
import { Criteria } from '@abejarano/ts-mongodb-criteria'; 

const userCriteria = new Criteria()
  .where('age').gt(18)
  .and('active').equals(true);

const users = await userRepository.find(userCriteria);
```

### DDD Architecture
Our architecture is designed following Domain-Driven Design principles:
- **Entities**: Represent the core objects of your application, e.g., User.
- **Repositories**: Encapsulate storage, retrieval, and search behavior.
- **Services**: Contain business logic and orchestrate between repositories and other services.

## Conclusion
This documentation provides an overview of the architecture and key components used in this project. For further details, refer to the code examples provided above.