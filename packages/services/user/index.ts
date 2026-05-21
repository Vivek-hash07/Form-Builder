import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  type SignInUserwithEmailAndPasswordInputType,
  signInUserwithEmailAndPasswordInput
} from "./model";

import * as jwt from "jsonwebtoken";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import { randomBytes, createHmac } from "node:crypto";
import { env } from "node:process";

class userService {
  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = jwt.sign({ id }, env.JWT_SECRET as string);
    return { token };
  }

  private async verifyUserToken(token: string): Promise<GenerateUserTokenPayloadType>{
    try{
      const verifiedToken = jwt.verify(token, env.JWT_SECRET as string) as GenerateUserTokenPayloadType
      return verifiedToken;
    } catch (error) {
      throw new Error("Invalid or expired token");
    }
  }

  public async getUserInfoByID(id: string){
    const user = await db.select({
      id: usersTable.id,
      email: usersTable.email,
      fullname: usersTable.fullName,
      profileURL: usersTable.profileImageUrl,
    }).from(usersTable).where(eq(usersTable.id, id));
    if (!user || user.length === 0) throw new Error(`User with this ID: ${id} does not exist`);
    return user[0];
  }

  public generateHash(salt: string, password: string){
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    //check if the user is already existing or not ?
    const existingUserWithEmail = await this.getUserByEmail(email);
    if (existingUserWithEmail) throw new Error(`User with this ${email} already exists`);

    //create a new user in DB
    const salt = randomBytes(16).toString("hex");
    const hash = this.generateHash(salt, password);

    const userInsertResult = await db
      .insert(usersTable)
      .values({ fullName, email, password: hash, salt })
      .returning({
        id: usersTable.id,
      });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new Error(`Something went wrong using creating a new user`);

    const userId = userInsertResult[0]?.id;
    const { token } = await this.generateUserToken({ id: userId });

    return {
      id: userId,
      token,
    };
  }

  public async signInUserwithEmailAndPassword(payload: SignInUserwithEmailAndPasswordInputType) {
    const { email, password} = await signInUserwithEmailAndPasswordInput.parseAsync(payload);

    const existingUser = await this.getUserByEmail(email);
    if (!existingUser) throw new Error(`User with this ${email} does not exist`);

    if(!existingUser.password || !existingUser.salt) throw new Error(`Invalid authentication menthod`);

    const hash = this.generateHash(existingUser.salt, password);

    if(hash !== existingUser.password) throw new Error(`Invalid email or password`);
    
    const { token } = await this.generateUserToken({ id: existingUser.id });

    return {
      id: existingUser.id,
      token
    }
  }

  public async verifyAndDecodeUserToken(token: string){
    const { id } = await this.verifyUserToken(token);
    return { id };
  }
}

export default userService;
