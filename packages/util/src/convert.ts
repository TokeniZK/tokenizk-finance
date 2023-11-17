import { Field, Scalar, Signature } from 'snarkyjs';
import { ProviderSignature } from './mina_provider';

// export function convertProviderSignatureToSignature(
//   sign: ProviderSignature
// ): Signature {
//   return Signature.fromObject({
//     r: Field(sign.field),
//     s: Scalar.fromJSON(sign.scalar),
//   });
// }

export function convertProviderSignatureToSignature(
  sign: ProviderSignature
): Signature {
  return Signature.fromObject({
    r: Field(sign.field),
    s: Scalar.fromJSON(sign.scalar),
  });
}
