import mongoose, { Schema, Document } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export enum UserRole {
  ADMIN = "Admin",
  USER = "User",
}

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  role: UserRole;
  verifyCode?: string;
  VerifyCodeExpiry?: Date;
  isVerified: boolean;
  isPasswordCorrect(password: string): Promise<boolean>;
  generateAccessToken(): string;
}

const userSchema = new Schema<UserDocument>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.USER,
    },
    verifyCode: {
      type: String,
    },
    VerifyCodeExpiry: {
      type: Date,
      default: () => new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Here we're going to use pre hook of mongoose to encrypt the password before saving it in the database Link : https://mongoosejs.com/docs/middleware.html#pre
// First we'll specify the event on which this middleware should run https://mongoosejs.com/docs/middleware.html
// Don't use arrow functions here — we need `function` to access the correct `this` (bound to the Mongoose document)

userSchema.pre("save", async function () {
  // Only hash the password if it's created for first time or only the password field has been changed
  if (!this.isModified("password")) {
    return;
  }
  this.password = await bcrypt.hash(this.password as string, 10);
});

// here, i will define custom methods using the methods object of mongoose's schemas
// It will also has access to this document before saving or after saving it into the database
// I would have no access to this model fields if i had created a normal functions

userSchema.methods.isPasswordCorrect = async function (password: string) {
  return await bcrypt.compare(password, this.password);
  // It will return true or false
};

// we're going to generate access token and refresh token both with different uses but are jwt
// Here both the tokens are doing the same work but the refresh token will contain less information compared to access token

userSchema.methods.generateAccessToken = function () {
  // these methods have the access of all the fields in the database and we can access them using this keyword
  return jwt.sign(
    {
      // this object contains the payload
      _id: this._id,
      email: this.email,
    },
    // It ensures that the environment variable is set and not undefined
    // this is the secret key that we will use to sign the token
    process.env.ACCESS_TOKEN_SECRET!,
    // the below object contains the expiry information of this token
    {
      expiresIn: "2d",
    }
  );
};


export const User =
  mongoose.models.User || mongoose.model<UserDocument>("User", userSchema);
