package main

import (
	"fmt"
	"go/ast"
	"go/format"
	"go/parser"
	"go/token"
	"io/ioutil"
	"reflect"
	//"golang.org/x/tools/go/ast/astutil"
	"bytes"
)

// If the type represents a struct (not an alias or primitive), it will have a package and file name identifier
type Type struct {
	Literal string `json:"literal"`
	// Package string `json:"package"`
	Struct string `json:"struct"`
}

type ClientStruct struct {
	Packages []Package `json:packages`
}

type Package struct {
	Name  string `json:"name"`
	Files []File `json:"files"`
}

type File struct {
	Name    string   `json:"name"`
	Structs []Struct `json:"structs"`
}

type Struct struct {
	Name   string  `json:"name"`
	Fields []Field `json:"fields"`
	//Methods []Method `json:"methods"`
}

// TODO multiple names per field
type Field struct {
	Name string `json:"name"`
	Type Type   `json:"type"`
}

type Method struct {
	Name       string `json:"name"`
	ReturnType []Type `json:"returnType"`
}

func GetStructsFile(fset *token.FileSet, f *ast.File, fname string) File {
	structs := []Struct{}
	//ast.Print(fset, f)
	// For all declarations
	for _, d := range f.Decls {
		if g, ok := d.(*ast.GenDecl); ok && g.Tok == token.TYPE {
			// For all type declarations
			for _, s := range g.Specs {
				if ts, ok := s.(*ast.TypeSpec); ok {
					if st, ok := ts.Type.(*ast.StructType); ok {
						fields := []Field{}
						for _, field := range st.Fields.List {
							// TODO: why can a field have multiple names?
							for _, name := range field.Names {
								// TODO: can the type be an expression?
								//fmt.Println(astutil.NodeDescription(field.Type))
								var buf bytes.Buffer
								if err := format.Node(&buf, fset, field.Type); err != nil {
									panic(err)
								}
								// stpackage, stname = GetType(field.Type)
								// fieldtype := Type{Literal: string(buf.Bytes()), Package: stpackage, Struct: stname}
								stname := GetType(field.Type)
								fieldtype := Type{Literal: string(buf.Bytes()), Struct: stname}
								fi := Field{Name: name.Name, Type: fieldtype}
								fields = append(fields, fi)
							}
						}
						structs = append(structs, Struct{Name: ts.Name.Name, Fields: fields})
					}
				}
			}
		}
	}
	fmt.Printf("%d structs found\n", len(structs))
	return File{Name: fname, Structs: structs}
}

// TODO: don't deeply nest
// https://golang.org/ref/spec#Struct_types
func GetStructsFileName(filename string) File {
	fset := token.NewFileSet()

	f, err := parser.ParseFile(fset, filename, nil, 0)
	if err != nil {
		panic(err)
	}
	return GetStructsFile(fset, f, filename)
}

func GetStructsDirName(path string) ([]Package, map[string]*ast.Package) {
	packages := []Package{}
	fset := token.NewFileSet()

	packagemap, err := parser.ParseDir(fset, path, nil, 0)
	if err != nil {
		panic(err)
	}
	for packagename, packageval := range packagemap {
		files := []File{}
		for fname, f := range packageval.Files {
			files = append(files, GetStructsFile(fset, f, fname))
		}
		packages = append(packages, Package{Name: packagename, Files: files})
	}
	return packages, packagemap
}

// Adds * for StarExpr, prints name for Ident, TODO: ignores other expressions
func GetType(node ast.Expr) string {
	switch node.(type) {
	case *ast.Ident:
		return node.(*ast.Ident).Name
	case *ast.ArrayType:
		return GetType(node.(*ast.ArrayType).Elt)
	case *ast.MapType:
		// TODO: also handle the value
		return GetType(node.(*ast.MapType).Key)
	case *ast.StarExpr:
		return GetType(node.(*ast.StarExpr).X)
	case *ast.FuncType:
		return "TODO"
	case *ast.SelectorExpr:
		fmt.Println(reflect.TypeOf(node.(*ast.SelectorExpr).X.(*ast.Ident).Name))
		return "TODO"
	default:
		fmt.Println(reflect.TypeOf(node))
		panic("Need to cover all Type Exprs")
	}
}

// (path, packages) -> (Write to directory)
// Given a client side struct data structure, deserialize it into an AST
// and write to the given directory
func WriteClientPackages(dirpath string, pkgs map[string]*ast.Package, clientpackages []Package) {
	for _, clientpackage := range clientpackages {
		for _, clientfile := range clientpackage.Files {
			packagename := clientpackage.Name
			packageast := pkgs[packagename]
			// Get the AST with the matching file name
			f := packageast.Files[clientfile.Name]

			// Update the AST with the values from the client
			f = clientFileToAST(clientfile, f)
			writeFileAST(clientfile.Name, f)
		}
	}
}

// Write the given AST to the filepath
func writeFileAST(filepath string, f *ast.File) {
	fset := token.NewFileSet()
	var buf bytes.Buffer
	if err := format.Node(&buf, fset, f); err != nil {
		panic(err)
	}
	err := ioutil.WriteFile(filepath+".new", buf.Bytes(), 0644)
	if err != nil {
		panic(err)
	}
}

// ClientFileToAST convert
func clientFileToAST(clientfile File, f *ast.File) *ast.File {
	f.Decls = removeStructDecls(f.Decls)
	newstructs := clientFileToDecls(clientfile)
	f.Decls = append(f.Decls, newstructs...)
	return f
}

// Given a client-formatted File struct, return a list of AST declarations
func clientFileToDecls(clientfile File) []ast.Decl {
	decls := []ast.Decl{}
	for _, clientstruct := range clientfile.Structs {
		decl := &ast.GenDecl{Tok: token.TYPE}
		fieldList := []*ast.Field{}
		for _, clientfield := range clientstruct.Fields {
			// TODO assuming literal == struct. Change to support more than ident
			// TODO tags
			field := ast.Field{
				Names: []*ast.Ident{&ast.Ident{Name: clientfield.Name}},
				Type:  ast.NewIdent(clientfield.Type.Struct)}
			fieldList = append(fieldList, &field)
		}
		fields := &ast.FieldList{List: fieldList}
		structExpr := &ast.StructType{Struct: token.NoPos, Fields: fields}
		spec := ast.TypeSpec{
			Name: ast.NewIdent(clientstruct.Name),
			Type: structExpr}
		decl.Specs = append(decl.Specs, &spec)
		decls = append(decls, decl)
	}
	return decls
}

func removeStructDecls(decls []ast.Decl) []ast.Decl {
	// TODO type definitions that aren't structs
	newdecls := []ast.Decl{}
	for _, decl := range decls {
		if g, ok := decl.(*ast.GenDecl); !ok || g.Tok != token.TYPE {
			newdecls = append(newdecls, decl)
		}
	}
	return newdecls
}
