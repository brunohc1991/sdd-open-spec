import { PageResult } from "@sdd/shared";
import { User, UserPageParams, UserRepository } from "../../src";

export class FakeUserRepository implements UserRepository {
  readonly createdUsers: User[] = [];

  async create(user: User): Promise<User> {
    this.createdUsers.push(user);

    return user;
  }

  async update(user: User): Promise<User> {
    const index = this.createdUsers.findIndex((item) => item.equals(user));

    if (index >= 0) {
      this.createdUsers[index] = user;
    }

    return user;
  }

  async delete(id: string): Promise<void> {
    const index = this.createdUsers.findIndex((item) => item.id === id);

    if (index >= 0) {
      this.createdUsers.splice(index, 1);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.createdUsers.find((item) => item.id === id) ?? null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.createdUsers.find((item) => item.email === email) ?? null;
  }

  async findPage(params: UserPageParams): Promise<PageResult<User>> {
    const start = (params.page - 1) * params.perPage;

    return {
      items: this.createdUsers.slice(start, start + params.perPage),
      page: params.page,
      perPage: params.perPage,
      total: this.createdUsers.length,
    };
  }
}
