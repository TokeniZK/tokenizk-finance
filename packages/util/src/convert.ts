import { Field, Scalar, Signature } from 'o1js';
import { ProviderSignature } from './mina_provider';


export function convertProviderSignatureToSignature(
  sign: ProviderSignature
): Signature {
  return Signature.fromObject({
    r: Field(sign.field),
    s: Scalar.fromJSON(sign.scalar),
  });
}
